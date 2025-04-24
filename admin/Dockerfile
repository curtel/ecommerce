FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Build the app with CRA
ENV DISABLE_ESLINT_PLUGIN=true
RUN npm run build

# Install serve to serve the static files
RUN npm install -g serve

EXPOSE 80

# Use serve to serve the React app
CMD ["serve", "-s", "build", "-l", "80"] 
