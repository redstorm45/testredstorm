FROM node:8-slim

# Add Tini
ENV TINI_VERSION v0.18.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini
RUN chmod +x /tini
ENTRYPOINT ["/tini", "--"]

# Create app directory
WORKDIR /usr/src/app
RUN chown -R node /usr/src/app

# Run as unprivileged user
USER node

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install --only=production

# Bundle app source
COPY . .

EXPOSE 8080
CMD [ "node", "index.js" ]

