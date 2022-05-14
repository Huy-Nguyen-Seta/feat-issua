#!/bin/bash
environment="${ENVIRONMENT}"
name="${APPLICATION}"
# AWS_STS_ACCOUNT_ID="${AWS_STS_ACCOUNT_ID}" # this one we will need to install aws cli to get info

binaries_endpoint="binaries-lb.aws-${environment}.veritone.com"
vpc_dns_zone_name="aws-${environment}.veritone.com"

GLOBAL_BASE_URL="http://${binaries_endpoint}/conf/global/base.json"
GLOBAL_APP_URL="http://${binaries_endpoint}/conf/global/${name}.json"
ENV_BASE_URL="http://${binaries_endpoint}/conf/aws-${environment}/base.json"
ENV_APP_URL="http://${binaries_endpoint}/conf/aws-${environment}/${name}.json"

# Download config files
# Only retry global base since it's guaranteed to be there
curl --retry 5 --retry-delay 2 ${GLOBAL_BASE_URL} --output /tmp/global_base.json
curl ${GLOBAL_APP_URL} --output /tmp/global_${name}.json
curl ${ENV_BASE_URL} --output /tmp/${environment}_base.json
curl ${ENV_APP_URL} --output /tmp/${environment}_${name}.json

# Verify each config is valid json, if not repalce with empty json {}
declare -a configFiles=(
    /tmp/global_base.json 
    /tmp/global_${name}.json
    /tmp/${environment}_base.json
    /tmp/${environment}_${name}.json
)
for file in "${configFiles[@]}"; do
    echo "Checking if $file contains valid json."
    jq . ${file} >/dev/null 2>&1 || {
        echo "Invalid json found in $file, replacing with {}" ;
        echo "{}" >${file} ;
    }
done

echo "Retrieving publicDnsZoneName from environment base config"
public_dns_zone_name=$(cat /tmp/${environment}_base.json | jq '.publicDnsZoneName' | tr -d '" ')

echo "Combining config to /app/config.json"
# Combine configs, globalBase ---> globalApp ---> envBase ---> envApp
jq -s '.[0] * .[1] * .[2] * .[3]' \
    "${configFiles[@]}" > /app/config.json.in

template_file () {
    [[ -f $1 ]] || return 0
    # copy all permissions from template.in -> rendered_file:
    cp -p $1 ${1%%.in}

    # NOTE: quote styles here are mixed based on need:
    sed -e "s/@@INTERNAL_DNS_ZONE@@/${vpc_dns_zone_name}/" \
             -e "s/@@EXTERNAL_DNS_ZONE@@/${public_dns_zone_name}/" \
             -e "s/@@ENVIRONMENT@@/${environment}/" \
             -e "s/@@AWS_STS_ACCOUNT_ID@@/${AWS_STS_ACCOUNT_ID}/" \
	     $1 > ${1%%.in}
}

template_file /app/config.json.in