FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY . .
ENV PORT=3014
EXPOSE 3014
CMD ["npm", "start"]

