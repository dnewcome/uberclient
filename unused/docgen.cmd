rem pulls javadoc-style comments out of js files
rem I want to also get the function prototype printed.. need to output next line
rem after the comment block 

now > docs.txt
for %%i in (../script/*.js) do (
echo %%i >> docs.txt
sgrep.pl -s "\/\*\*" -e "\*\/" -f ../script/%%i >> docs.txt 
)
