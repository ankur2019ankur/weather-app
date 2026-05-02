Offline Installation Instructions for Node.js and PM2
1. Deliverables for offline mode
The following files must be present in the same directory on the target RHEL server:
node-v24.15.0-linux-x64.tar.xz (Node.js Binary)
pm2-offline.tar.xz (Project folder containing pre-installed PM2)
installNodeAndNpm.sh (Node.js and npm installation script)
install_pm2.sh (PM2 global configuration script)

2. Execution Steps
Step A: Provide Execution Permissions
Before running the scripts, ensure they are executable:
chmod a+x installNodeAndNpm.sh 
chmod a+x install_pm2.sh

Step B: Install Node.js and NPM
Run the first script to extract the Node.js binaries and configure the system PATH.
sudo ./installNodeAndNpm.sh
Verification: After the script finishes, the admin should verify the installation by running:
node -v (Should return v18.20.2)
npm -v (Should return the version bundled with Node 18)
Note: close the previous terminal first then open the new terminal then run the above commands and verify the installation
Step C: Install PM2 Globally
Run the second script. 
sudo ./install_pm2.sh
Verification: The admin should verify PM2 is active by running:
pm2 -v
Note: close the previous terminal first then open the new terminal then run the above commands and verify the installation
