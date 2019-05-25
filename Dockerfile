# 1. Grab the latest node image
FROM node:latest
# 2. Set the working directory inside the container to /app
WORKDIR /app
# 3. Add the .env to the directory (We need those variables)
ADD .env /app
# 4. Expose port defined in .env file
EXPOSE ${PORT}
# 5. Add package.json to the directory
ADD package.json /app
# 6. Install dependencies
RUN npm install
# 7. Copy the rest into directory
COPY . /app
# 8. Start the app inside the container
CMD ["npm", "start"]