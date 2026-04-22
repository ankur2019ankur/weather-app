import axios from "axios";
import https from "https";

const PAM_BASE_URL = (process.env.PAM_BASE_URL ?? "https://192.168.1.209").replace(/\/$/, "");
const RESOURCE_POOLS_URL = `${PAM_BASE_URL}/rest/accessctrl/resourcepools`;

export const runtime = "nodejs";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const body = await request.json();
    const incomingCookie = body?.cookie;

    if (!incomingCookie || typeof incomingCookie !== "string") {
      return Response.json(
        { message: "Request body must include a valid cookie string" },
        { status: 400 },
      );
    }

    const { id } = await context.params;
    if (!id?.trim()) {
      return Response.json({ message: "Resource id is required" }, { status: 400 });
    }

    const resourceId = id.trim();
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false,
    });

    const [assignmentsResponse, resourcePoolsResponse] = await Promise.all([
      axios.get(`${PAM_BASE_URL}/rest/accessctrl/assignments`, {
        headers: {
          Cookie: incomingCookie,
          Accept: "application/json, text/plain, */*",
        },
        httpsAgent,
        timeout: 15000,
      }),
      axios.get(RESOURCE_POOLS_URL, {
        headers: {
          Cookie: incomingCookie,
          Accept: "application/json, text/plain, */*",
        },
        httpsAgent,
        timeout: 15000,
      }),
    ]);

    const assignmentsData = assignmentsResponse.data as {
      Result?: { Assignment?: Array<Record<string, unknown>> };
      [key: string]: unknown;
    };
    const assignments = Array.isArray(assignmentsData?.Result?.Assignment)
      ? assignmentsData.Result.Assignment
      : [];

    const resourcePoolsData = resourcePoolsResponse.data as {
      Result?: { ResourcePool?: Array<Record<string, unknown>> };
    };
    const resourcePools = Array.isArray(resourcePoolsData?.Result?.ResourcePool)
      ? resourcePoolsData.Result.ResourcePool
      : [];

    const resourcePoolIds = resourcePools
      .map((pool) => Number(pool.id))
      .filter((poolId) => Number.isInteger(poolId) && poolId > 0);

    const poolDetailsResponses = await Promise.all(
      resourcePoolIds.map((poolId) =>
        axios.get(`${PAM_BASE_URL}/rest/accessctrl/resourcepool/${poolId}`, {
          headers: {
            Cookie: incomingCookie,
            Accept: "application/json, text/plain, */*",
          },
          httpsAgent,
          timeout: 15000,
        }),
      ),
    );

    type FilteredResourcePool = {
      id?: number;
      name?: string;
      resources: Array<Record<string, unknown>>;
      [key: string]: unknown;
    };

type UserRoleDetail = {
  id: number;
  name: string;
  include: Array<Record<string, unknown>>;
};

    const toPoolId = (value: unknown): number | null => {
      const parsed = Number(value);
      return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
    };

    const extractResourcePoolIdFromAssignment = (
      assignment: Record<string, unknown>,
    ): number | null => {
      const directCandidates = [
        assignment.resourcepoolid,
        assignment.resource_pool_id,
        assignment.resourcePoolId,
        assignment.resourcepool_id,
        assignment.poolid,
        assignment.pool_id,
      ];

      for (const candidate of directCandidates) {
        const parsed = toPoolId(candidate);
        if (parsed !== null) return parsed;
      }

      const include = assignment.include;
      if (!Array.isArray(include)) return null;

      for (const includeItem of include) {
        if (!includeItem || typeof includeItem !== "object") continue;
        const item = includeItem as Record<string, unknown>;
        const itemType = String(item.type ?? "").toLowerCase();
        if (!itemType.includes("resource-pool")) continue;

        const parsedFromData = toPoolId(item.data);
        if (parsedFromData !== null) return parsedFromData;

        const parsedFromId = toPoolId(item.id);
        if (parsedFromId !== null) return parsedFromId;
      }

      return null;
    };

    const extractUserRoleIdsFromAssignment = (
      assignment: Record<string, unknown>,
    ): number[] => {
      const roleIds = new Set<number>();
      const parseRoleId = (value: unknown): number | null => {
        const parsed = Number(value);
        return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
      };

      const directCandidates = [
        assignment.userroleid,
        assignment.user_role_id,
        assignment.userRoleId,
        assignment.userrole_id,
        assignment.roleid,
        assignment.role_id,
      ];

      for (const candidate of directCandidates) {
        const parsed = parseRoleId(candidate);
        if (parsed !== null) roleIds.add(parsed);
      }

      const nestedUserRole = assignment.UserRole;
      if (nestedUserRole && typeof nestedUserRole === "object") {
        const parsed = parseRoleId((nestedUserRole as Record<string, unknown>).id);
        if (parsed !== null) roleIds.add(parsed);
      }

      const include = assignment.include;
      if (!Array.isArray(include)) return Array.from(roleIds);

      for (const includeItem of include) {
        if (!includeItem || typeof includeItem !== "object") continue;
        const item = includeItem as Record<string, unknown>;
        const itemType = String(item.type ?? "").toLowerCase();
        if (!itemType.includes("user-role") && !itemType.includes("userrole")) continue;

        const parsedFromData = parseRoleId(item.data);
        if (parsedFromData !== null) roleIds.add(parsedFromData);

        const parsedFromId = parseRoleId(item.id);
        if (parsedFromId !== null) roleIds.add(parsedFromId);
      }

      return Array.from(roleIds);
    };

    const filteredResourcePools = poolDetailsResponses
      .map((poolResponse) => {
        const pool = (poolResponse.data as {
          Result?: {
            ResourcePool?: {
              id?: number;
              name?: string;
              resources?: Array<Record<string, unknown>>;
              [key: string]: unknown;
            };
          };
        })?.Result?.ResourcePool;

        if (!pool) return null;

        const resources = Array.isArray(pool.resources) ? pool.resources : [];
        const matchingResources = resources.filter(
          (resource) => String(resource.id ?? "") === resourceId,
        );

        if (matchingResources.length === 0) return null;

        return {
          ...pool,
          resources: matchingResources,
        };
      })
      .filter((pool): pool is FilteredResourcePool => pool !== null);

    const filteredResourcePoolIds = new Set(
      filteredResourcePools
        .map((pool) => toPoolId(pool.id))
        .filter((poolId): poolId is number => poolId !== null),
    );

    const filteredAssignments = assignments.filter((assignment) => {
      const matchedPoolId = extractResourcePoolIdFromAssignment(assignment);
      return matchedPoolId !== null && filteredResourcePoolIds.has(matchedPoolId);
    });

    const userRoleIds = Array.from(
      new Set(filteredAssignments.flatMap((assignment) => extractUserRoleIdsFromAssignment(assignment))),
    );


    return Response.json(
      {
        ...userRoleIds,
        // Result: {
        //   ...(assignmentsData?.Result ?? {}),
        //   Assignment: filteredAssignments,
        //   UserRole: {
        //     id: userRoles[0]?.id ?? Number(resourceId),
        //     name:
        //       userRoles.length === 1
        //         ? userRoles[0]?.name
        //         : `${userRoles.length} roles`,
        //     include: includeRows,
        //   },
        //   UserRoles: userRoles,
        //   ResourcePool: filteredResourcePools,
        // },
      },
      { status: 200 },
    );

   
    const userRoleDetailResponses = await Promise.all(
      userRoleIds.map((userRoleId) =>
        axios.get(`${PAM_BASE_URL}/rest/accessctrl/userrole/${userRoleId}`, {
          headers: {
            Cookie: incomingCookie,
            Accept: "application/json, text/plain, */*",
          },
          httpsAgent,
          timeout: 15000,
        }),
      ),
    );

    const userRoles: UserRoleDetail[] = userRoleDetailResponses
      .map((roleResponse) => {
        const role = (roleResponse.data as {
          Result?: {
            UserRole?: {
              id?: number;
              name?: string;
              include?: Array<Record<string, unknown>>;
            };
          };
        })?.Result?.UserRole;
        if (!role) return null;

        const parsedRoleId = toPoolId(role.id);
        if (parsedRoleId === null) return null;

        return {
          id: parsedRoleId,
          name: String(role.name ?? `Role ${parsedRoleId}`),
          include: Array.isArray(role.include) ? role.include : [],
        };
      })
      .filter((role): role is UserRoleDetail => role !== null);

      

    const includeRows = userRoles.flatMap((role) =>
      role.include.map((includeItem) => ({
        type: String(includeItem.type ?? "-"),
        source: String(includeItem.source ?? "-"),
        data: String(includeItem.data ?? "-"),
      })),
    );

    return Response.json(
      {
        ...assignmentsData,
        Result: {
          ...(assignmentsData?.Result ?? {}),
          Assignment: filteredAssignments,
          UserRole: {
            id: userRoles[0]?.id ?? Number(resourceId),
            name:
              userRoles.length === 1
                ? userRoles[0]?.name
                : `${userRoles.length} roles`,
            include: includeRows,
          },
          UserRoles: userRoles,
          ResourcePool: filteredResourcePools,
        },
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      return Response.json(
        {
          message: "Upstream API returned an error",
          status: error.response.status,
          data: error.response.data,
        },
        { status: error.response.status },
      );
    }

    const message = error instanceof Error ? error.message : "Unknown server error";
    return Response.json(
      {
        message: "Failed to call role API",
        error: message,
      },
      { status: 500 },
    );
  }
}
