import { createSessionClient } from "@/lib/appwrite";
import { getSignedUrl } from "@/lib/storage";
import { B2_BUCKET_NAME } from "@/config";

export const getCurrent = async () => {
  try {
    const { account } = await createSessionClient();

    const user = await account.get();
    
    // Generate signed URL for profile image if it exists and is a fileId
    if (
      user.prefs?.imageUrl &&
      !user.prefs.imageUrl.startsWith("data:image") &&
      !user.prefs.imageUrl.startsWith("http")
    ) {
      try {
        user.prefs.imageUrl = await getSignedUrl(B2_BUCKET_NAME, user.prefs.imageUrl);
      } catch (error) {
        console.error("Error generating signed URL for profile image:", error);
      }
    }
    
    return user;
  } catch {
    return null;
  }
};
