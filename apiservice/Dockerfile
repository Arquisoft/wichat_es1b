# Use an official Node.js runtime as a parent image
FROM node:22

# Set the working directory in the container
WORKDIR /usr/src/apiservice

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

ARG API_URI="http://gatewayservice:8000"
ENV REACT_APP_API_ENDPOINT=$API_URI

# Install app dependencies
RUN npm install

# Copy the app source code to the working directory
COPY . .

EXPOSE 7000
# Define the command to run your app
CMD ["node", "api-service.js"]