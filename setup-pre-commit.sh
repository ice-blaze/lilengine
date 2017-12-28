#!/bin/bash
file=".git/hooks/pre-commit"
lint="docker-compose run --no-deps lint"
if [ -f $file ]; then
    if grep -Fxq "$lint" $file ; then
        exit
    fi
fi
printf "#!/bin/bash\n$lint\n" > $file
chmod +x $file
