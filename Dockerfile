FROM node:10

# Create app directory
WORKDIR /usr/src/app

#need to change root directory permission  
RUN chgrp 0 ./ && \
    chmod g=u ./

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

RUN npm install

RUN npm audit fix
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE 8080
CMD [ "node", "app.js" ]