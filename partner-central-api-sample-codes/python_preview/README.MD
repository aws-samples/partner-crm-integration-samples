Run this to get started
```shell
python -m venv pcapi
source ./pcapi/bin/activate
python -m pip install -r requirements.txt
```

If you need to uninstall previously installed boto3
```shell
pip uninstall boto3
pip cache purge
```

Run this to generate types if needed
```shell
python -m mypy_boto3_builder stubs \
-s partnercentral-selling --skip-published
```