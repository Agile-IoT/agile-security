
##########################################################################################################################
#
#	locations of configuration and database folders in the host system
#
##########################################################################################################################

#location of original configuration file (will be rewritten to set up locations of databases properly by the set_up.sh script)
CONF=`readlink -f $(pwd)/../../conf`
#Location of the rewritten configuration file used from the local machine to access the database by running the scripts in the /scripts 
# folder in agile-idm-web project.
LOCAL_CONF=`readlink -f ./host_confs`
#Location of the rewritten configuration file used from the docker image is placed (this configuration is passed in the start-docker.sh script)
LOCAL_DOCKER_CONF=`readlink -f ./docker_host_confs`
#Database location in the Host system (accessible in DOCKER_DB folder from the docker image)
DB=`readlink -f $(pwd)/db`


##########################################################################################################################
#
#	locations used inside the docker instance (where the LOCAL* folders are mounted as volumes
#
##########################################################################################################################

#Location of the database folder from the container. This folder points to the $DB in the host
DOCKER_DB=/var/lib/idm/db
#Location to mount the $LOCAL_DOCKER_CONF folder
DOCKER_CONF=/etc/idm/

##########################################################################################################################
#
#					Create folders needed
#
##########################################################################################################################


function createFolderIfNeeded {
  if [[ -d $1 ]]; then
    echo "$1 directory already exists (fine)"
  elif [[ -f $1 ]]; then
    echo "$1 is a file. Move it somewhere else..."
    exit 1
  else
    mkdir $1
    echo "created $1 as database folder (fine)"
  fi
}


createFolderIfNeeded "$DB"
createFolderIfNeeded "$LOCAL_CONF"
createFolderIfNeeded "$LOCAL_DOCKER_CONF"
