var admin = require('firebase-admin');

module.exports = async (token_list, message) => {
    await admin.messaging().sendToDevice(
        token_list, // ['token_1', 'token_2', ...]
        message,
        {
          // Required for background/quit data-only messages on iOS
          contentAvailable: true,
          // Required for background/quit data-only messages on Android
          priority: "high",
        }
    );
}
