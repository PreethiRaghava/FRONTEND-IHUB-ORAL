var Minio = require("minio");
console.log("before minio");
var minioClient = new Minio.Client({
  endPoint: process.env.REACT_APP_MINIO_ACCESS_IP,
  port: parseInt(process.env.REACT_APP_MINIO_ACCESS_PORT),
  useSSL: false,
  accessKey: process.env.REACT_APP_MINIO_ACCESS_KEY,
  secretKey: process.env.REACT_APP_MINIO_ACCESS_SECRET
});
console.log("after minio");
var minioBucket = process.env.REACT_APP_DEV === "true" ? process.env.REACT_APP_MINIO_BUCKET_DEV : process.env.REACT_APP_MINIO_BUCKET_PROD
export {minioClient, minioBucket}
