import { redirect } from "next/navigation";
import { getCurrent } from "@/features/auth/queries";
import { EditProfileForm } from "@/features/auth/components/edit-profile-form";

const ProfilePage = async () => {
    const user = await getCurrent();

    if (!user) {
        redirect("/sign-in");
    }

    return (
        <div className="w-full lg:max-w-4xl mx-auto">
            <EditProfileForm initialValues={user} />
        </div>
    );
}

export default ProfilePage;

