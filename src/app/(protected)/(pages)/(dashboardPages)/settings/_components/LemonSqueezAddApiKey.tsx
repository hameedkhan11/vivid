"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Plus } from "lucide-react";
import { addLemonSqueezyApiKey } from "@/actions/user";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import LemonKeyInput from "./LemonKeyInput";
import StoreIdInput from "./StoreIdInput";
import LemonSqueezyWebhook from "./LemonSqueezyWebhook";

type Props = {
  lemonSqueezyApiKey: string;
  storeId: string;
  webhookSecret: string;
};

const LemonSqueezAddApiKey = ({
  lemonSqueezyApiKey,
  storeId,
  webhookSecret,
}: Props) => {
  console.log("🍋", !storeId);
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [newApiKey, setNewApiKey] = useState("");
  const [newStoreId, setNewStoreId] = useState("");
  const [newWebhookSecret, setNewWebhookSecret] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await addLemonSqueezyApiKey(newApiKey, newStoreId, newWebhookSecret);
      if (res.status !== 200) {
        throw new Error("Unable to add API Key");
      }

      toast({
        title: "Success",
        description: "API Key added successfully",
        variant: "default",
      });
      setNewApiKey("");
      setNewStoreId("");
      setNewWebhookSecret("");
      router.refresh();
    } catch (error) {
      console.error("🔴 ERROR", error);
      toast({
        title: "Error",
        description: "Unable to add API Key",
        variant: "destructive",
      });
    } finally {
      setOpen(false);
    }

    if(open){
      setOpen(false);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex w-full items-center justify-between gap-x-4">
        <p className="text-lg">Lemon Squeezy API Key</p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            {(!lemonSqueezyApiKey || !storeId || !webhookSecret) && (
              <Button variant="default" className="flex items-center gap-2">
                <Plus />
              </Button>
            )}
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Lemon Squeezy API Key and Store Id</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col space-y-4 py-4">
              <Input
                type="password"
                placeholder="Enter API Key"
                value={newApiKey}
                onChange={(e) => setNewApiKey(e.target.value)}
                className=""
              />

              <Input
                type="password"
                placeholder="Enter StoreId Key"
                value={newStoreId}
                onChange={(e) => setNewStoreId(e.target.value)}
                className=""
              />

              <Input
                type="password"
                placeholder="Enter Webhook Key"
                value={newWebhookSecret}
                onChange={(e) => setNewWebhookSecret(e.target.value)}
                className=""
              />

              <Button onClick={handleSave}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Set API Key"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {lemonSqueezyApiKey && (
        <LemonKeyInput lemonSqueezyApiKey={lemonSqueezyApiKey} />
      )}

      {storeId && <StoreIdInput storeId={storeId} />}

      {webhookSecret && <LemonSqueezyWebhook webhookSecret={webhookSecret} />}
    </div>
  );
};

export default LemonSqueezAddApiKey;
