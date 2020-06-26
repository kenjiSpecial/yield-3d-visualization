ARG VARIANT=3.7
FROM mcr.microsoft.com/vscode/devcontainers/python:0-${VARIANT}

# ADD . /root
COPY . /app
WORKDIR /app

RUN pip install -r requirements.txt

CMD ["uvicorn", "api:app", "--reload", "--host", "0.0.0.0", "--port", "8000"]