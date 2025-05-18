import React from "react";
import LemonSqueezAddApiKey from "./_components/LemonSqueezAddApiKey";
import { onAuthenticateUser } from "@/actions/user";

const page = async () => {
  const checkUser = await onAuthenticateUser();
  return (
    <div className="flex flex-col gap-6 relative">
      <div className="flex justify-between items-center">
        <div className="flex flex-col items-start">
          <h1 className="text-2xl font-semibold dark:text-primary backdrop-blur-lg ">
            Settings
          </h1>
          <p className="text-base font-normal dark:text-secondary">
            All your settings
          </p>
        </div>
      </div>
      <LemonSqueezAddApiKey
        lemonSqueezyApiKey={
          checkUser?.user?.lemonSqueezyApiKey || ""
        }

        storeId={
          checkUser?.user?.storeId || ""
        }
        webhookSecret={
          checkUser?.user?.webhookSecret || ""
        }
      />
    </div>
  );
};

export default page;
