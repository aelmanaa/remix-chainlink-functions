#!/bin/bash

#set working dir of the script
cd "$(dirname "$0")" || exit

node_modules_path="../node_modules"
if [ ! -d "${node_modules_path}" ]; then
    echo "${node_modules_path} does not exist."
    exit 1
fi
abis_path="../src/abis"
if [ ! -d "${abis_path}" ]; then
    echo "${abis_path} does not exist. Create abis folder"
    mkdir ${abis_path}
fi

rm -rf "${abis_path:?}"/*

types_path="../src/types-abis"
if [ ! -d "${types_path}" ]; then
    echo "${types_path} does not exist. Create types folder"
    mkdir ${types_path}
fi

rm -rf "${types_path:?}"/*

node_modules=("@chainlink/contracts/abi/v0.4/LinkToken.json" "@chainlink/contracts/abi/v0.8/FunctionsBillingRegistry.json" "@chainlink/contracts/abi/v0.8/FunctionsOracle.json")
https=("https://raw.githubusercontent.com/aelmanaa/ocr2dr-hardhat-starter-kit/remix-samples/remix-samples/abis/FunctionsConsumer.json")

echo "fetch abis from node_modules"
failed="false"
for file in "${node_modules[@]}"; do
    echo "fetch ${file}"
    path="${node_modules_path}/${file}"
    if [ -f "${path}" ]; then
        cp "${path}" "${abis_path}"
    else
        echo "${path} does not exist."
        failed="true"
    fi
done
for file in "${https[@]}"; do
    echo "fetch ${file}"
    fileName=$(echo "${file}" | grep -Eo '[a-zA-Z0-9]+\.json')
    if [ -n "${fileName}" ]; then
        http_response=$(curl -s -o "${abis_path}/${fileName}" -w "%{http_code}" "${file}")
        if [ "${http_response}" -gt "399" ]; then
            echo "${file} not fetched. ${http_response}"
            failed="true"
        fi
    else
        echo "File not an abi ${fileName}"
        failed="true"
    fi
done

if [ "${failed}" == "true" ]; then
    echo "Some abis could not be fetch. check logs!"
    exit 2
fi

# If everyhting ok generate typings
npx typechain --target=ethers-v5 --out-dir ${types_path} "${abis_path}/**/*.json"
if [ $? -eq 0 ]; then
    # check if directory is empty (in case typechain returns 0 while it failed)
    if [ "$(ls -A ${types_path})" ]; then
        echo "Typings generated correctly"
    else
        echo "Typings were not generated" >&2
        exit 3
    fi
else
    echo "Typings were not generated" >&2
    exit 4
fi
