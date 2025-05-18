"use client";
import {
  containerVariants,
  itemVariants,
  themes,
  timeAgo,
} from "@/lib/constants";
import { motion } from "framer-motion";
import { Project } from "@prisma/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { BuyTemplate } from "@/actions/lemonSqueezy";
import { getUser } from "@/actions/user";
import { ThumbnailPreview } from "@/components/global/project-card/ThumbnailPreview";
import { useRouter } from "next/navigation";
import { PrismaUser } from "@/lib/types";

type Props = {
  projects: Project[];
  user: PrismaUser;
};

export const BuyTemplateCard = ({ projects, user }: Props) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleBuy = async (
    variantId: string,
    projectId: string,
    sellerId: string
  ) => {
    setLoading(true);

    if (!variantId) {
      setLoading(false);
      toast({
        title: "Error",
        description: "Variant not found",
        variant: "destructive",
      });
      return;
    }

    const seller = await getUser(sellerId);
    if (
      seller.status !== 200 ||
      !seller.user?.lemonSqueezyApiKey ||
      !seller.user?.storeId ||
      !seller.user?.webhookSecret
    ) {
      setLoading(false);
      toast({
        title: "Error",
        description: "Seller Details not found",
        variant: "destructive",
      });
      return;
    }

    try {
      const res = await BuyTemplate(
        variantId,
        projectId,
        seller.user.webhookSecret,
        sellerId,
        user.id
      );
      if (res.status !== 200) {
        throw new Error("Unable to buy template");
      }
      toast({
        title: "Redirecting....",
        description: "Redirecting to Lemon Squeezy",
        variant: "default",
      });
      // console.log("Template bought successfully", res);

      router.push(res.url);
    } catch (error) {
      console.error("🔴 ERROR", error);
      toast({
        title: "Error",
        description: "Unable to buy template",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {projects.map((project, i) => (
        <motion.div
          className={`group w-full flex flex-col gap-y-3 rounded-xl p-3 transition-colors`}
          variants={itemVariants}
          key={i}
        >
          <div
            className="relative aspect-[16/10] overflow-hidden rounded-lg cursor-pointer"
            onClick={() => {}}
          >
            <ThumbnailPreview
              slide={JSON.parse(JSON.stringify(project.slides))?.[0]}
              theme={
                themes.find((t) => t.name === project.themeName) || themes[0]
              }
            />
          </div>
          <div className="w-full">
            <div className="space-y-1">
              <h3 className="font-semibold text-base text-primary line-clamp-1">
                {project.title}
              </h3>
              <div className="flex w-full justify-between items-center gap-2">
                <p className="text-sm text-muted-foreground">
                  {timeAgo(project.createdAt.toString())}
                </p>

                <Button
                  size="sm"
                  variant="destructive"
                  disabled={
                    loading ||
                    user.id === project.userId ||
                    user?.PurchasedProjects?.some((p) => p.id === project.id)
                  }
                  onClick={() =>
                    handleBuy(
                      project.varientId || "",
                      project.id,
                      project.userId
                    )
                  }
                >
                  {loading
                    ? "Processing..."
                    : user.PurchasedProjects?.some((p) => p.id === project.id)
                    ? "Owned"
                    : "Buy"}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};
