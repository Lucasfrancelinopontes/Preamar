FROM node:18-alpine

WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm ci --only=production || npm install --only=production

# Bundle app source
COPY . .

EXPOSE 3000

CMD ["npm", "start"]
