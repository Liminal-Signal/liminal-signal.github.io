FROM python:3.11-slim

WORKDIR /beans

# Install git, make, npm, and markdownlint-cli
RUN apt-get update && \
    apt-get install -y git make npm && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

RUN npm install -g markdownlint-cli

COPY . .

EXPOSE 8000

ENTRYPOINT ["mkdocs"]
CMD ["serve", "-a", "0.0.0.0:8000"]
