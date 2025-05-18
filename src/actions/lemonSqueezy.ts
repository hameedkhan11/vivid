"use server";

import lemonSqueezyClient from "@/lib/axios";
import { onAuthenticateUser } from "./user";
import { client } from "@/lib/prisma";

export const getSubscription = async (varientId: string) => {
  try {
    const res = await lemonSqueezyClient().post("/checkouts", {
      data: {
        type: "checkouts",
        relationships: {
          store: {
            data: {
              type: "stores",
              id: process.env.LEMON_SQUEEZY_STORE_ID?.toString(),
            },
          },
          variant: {
            data: {
              type: "variants",
              id: varientId,
            },
          },
        },
      },
    });
    const url = res.data.data.attributes.url;
    return { url, status: 200 };
  } catch (error) {
    console.error("🔴 ERROR", error);
    return { message: "Internal Server Error", status: 500 };
  }
};

export const addProductVarientId = async (
  projectId: string,
  varientId: string
) => {
  try {
    const checkUser = await onAuthenticateUser();

    if (checkUser.status !== 200 || !checkUser.user) {
      return { status: 403, error: "User not authenticated" };
    }

    if (!checkUser.user.lemonSqueezyApiKey) {
      return { status: 403, error: "Add Lemon Squeezy API key in Settings" };
    }

    console.log(
      "Adding product varient id...",
      typeof projectId,
      typeof varientId
    );
    const project = await client.project.update({
      where: { id: projectId },
      data: {
        varientId: varientId,
        isSellable: true,
      },
    });

    if (!project) {
      return { status: 500, error: "Failed to add product varient id" };
    }

    return { status: 200, data: project };
  } catch (error) {
    console.error("🔴 ERROR", error);
    return { message: "Internal Server Error", status: 500, error };
  }
};

export const BuyTemplate = async (
  variantId: string,
  projectId: string,
  webhookSecret: string,
  sellerUserId: string,
  buyerUserId: string
) => {
  try {

    const user = await client.user.findFirst({
      where: {
        id: sellerUserId,
      },
    });

    if(!user){
      return { status: 404, error: "User not found" };
    }

    // Create checkout request for User's product using Kuldeep's API key and Sunny's store ID
    const res = await lemonSqueezyClient(user.lemonSqueezyApiKey!).post("/checkouts", {
      data: {
        type: "checkouts",
        attributes: {
          checkout_data: {
            custom: {
              projectId: projectId,
              buyerUserId:buyerUserId,
              secret:webhookSecret
            }
          },
          product_options: {
            "redirect_url": `${process.env.NEXT_PUBLIC_HOST_URL}/dashboard`,
          }
        },
        relationships: {
          store: {
            data: {
              type: "stores",
              id: user.storeId, // User's store ID
            },
          },
          variant: {
            data: {
              type: "variants",
              id: variantId, // User's product variant ID
            },
          },
        },
      },
    });

    // Get the checkout URL to send to the customer
    const checkoutUrl = res.data.data.attributes.url;
    return { url: checkoutUrl, status: 200 };
  } catch (error) {
    // Handle any errors
    console.error("🔴 ERROR", error);

    return { message: "Internal Server Error", status: 500 };
  }
};



export const BuySubscription = async (
  buyerUserId: string
) => {
  try {

    // Create checkout request for User's product using Kuldeep's API key and Sunny's store ID
    const res = await lemonSqueezyClient(process.env.LEMON_SQUEEZY_API_KEY).post("/checkouts", {
      data: {
        type: "checkouts",
        attributes: {
          checkout_data: {
            custom: {
              buyerUserId:buyerUserId,
            }
          },
          product_options: {
            "redirect_url": `${process.env.NEXT_PUBLIC_HOST_URL}/dashboard`,
          }
        },
        relationships: {
          store: {
            data: {
              type: "stores",
              id: process.env.LEMON_SQUEEZY_STORE_ID, // User's store ID
            },
          },
          variant: {
            data: {
              type: "variants",
              id: process.env.LEMON_SQUEEZY_VARIANT_ID, // User's product variant ID
            },
          },
        },
      },
    });

    // Get the checkout URL to send to the customer
    const checkoutUrl = res.data.data.attributes.url;
    return { url: checkoutUrl, status: 200 };
  } catch (error) {
    // Handle any errors
    console.error("🔴 ERROR", error);

    return { message: "Internal Server Error", status: 500 };
  }
};
