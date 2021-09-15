var admin = require('firebase-admin');

module.exports = async (token_list, fcm_message_background, fcm_message_foreground) => {
    await admin.messaging().sendToDevice(
        token_list, // ['token_1', 'token_2', ...]
        fcm_message_background,
        {
          // Required for background/quit data-only messages on iOS
          contentAvailable: true,
          // Required for background/quit data-only messages on Android
          priority: "high",
        }
    );
    await admin.messaging().sendToDevice(
      token_list, // ['token_1', 'token_2', ...]
      fcm_message_foreground,
      {
        // Required for background/quit data-only messages on iOS
        contentAvailable: true,
        // Required for background/quit data-only messages on Android
        priority: "high",
      }
    );
}
