const imagekit = require("imagekit");
const ErrorHandler = require("./errorHandler");

module.exports.uploadImagesViaImageKit = async (
  imageBuffer,
  imageName,
  folderPath
) => {
  const ImageKit = new imagekit({
    publicKey: process.env.IMAGEKIT_PUBLIC,
    privateKey: process.env.IMAGEKIT_SECRET,
    urlEndpoint: process.env.IMAGEKIT_URL,
  });
  imageBuffer = imageBuffer.toString("base64");
  let data = undefined;
  await ImageKit.upload({
    file: imageBuffer,
    fileName: imageName,
    folder: folderPath,
    extensions: [
      {
        name: "google-auto-tagging",
        maxTags: 10,
        minConfidence: 95,
      },
    ],
  })
    .then((res) => {
      data = res;
    })
    .catch((err) => {
        console.log(err);
      return next(new ErrorHandler(302, `Image cannot upload`));
    });
  return data.url;
};

