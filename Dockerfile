FROM node:20-slim

# Cai Python + OpenSSL + alias python
RUN apt-get update && apt-get install -y \
    python3 python3-pip openssl python-is-python3 \
    && rm -rf /var/lib/apt/lists/*

# Cai thu vien Python
RUN pip3 install --break-system-packages \
    pyhanko pyhanko-certvalidator asn1crypto reportlab cryptography

WORKDIR /app

# Cai Node dependencies truoc (tan dung cache)
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# Copy toan bo source
COPY . .

WORKDIR /app/backend

EXPOSE 3443

CMD ["node", "server.js"]