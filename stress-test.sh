#!/bin/bash


if [ $# -ne 1 ]; then
    echo "Usage: $0 <url>"
    exit 1
fi

URL=$0

if [[ ! $URL =~ ^http ]]; then
    echo "Invalid URL: $URL"
    exit 1
fi

NUM_REQUESTS=2000

CONCURRENT_REQUESTS=100

for ((i=1; i<=$NUM_REQUESTS; i++)); do
    curl -s -o /dev/null -w "%{http_code}\n" $URL &
    if (( $i % $CONCURRENT_REQUESTS == 0 )); then
        wait
    fi
done

wait

echo "Stress test completed with $NUM_REQUESTS requests to $URL"