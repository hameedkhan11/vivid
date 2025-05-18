import { useState, useEffect } from "react";
import { Loader2, WalletCards } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { addLemonSqueezyApiKey, onAuthenticateUser } from "@/actions/user";
import { useToast } from "@/hooks/use-toast";
import { useSlideStore } from "@/store/useSlideStore";
import Link from "next/link";
import { addProductVarientId } from "@/actions/lemonSqueezy";

export default function SellTemplate() {
  const [showPublish, setShowPublish] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [storeId, setStoreId] = useState("");
  const [sellId, setSellId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { project, setProject } = useSlideStore();


  useEffect(() => {
    (async () => {
      const checkUser = await onAuthenticateUser();
      console.log("checkUser", checkUser);
      if (
        checkUser.status === 200 &&
        checkUser.user?.lemonSqueezyApiKey &&
        checkUser.user?.storeId
      ) {
        setShowPublish(true);
      }
    })();
  }, []);

  const handlePublish = async () => {
    setIsLoading(true);
    console.log("Publishing template...");
    if (!project) {
      toast({
        title: "Error",
        description: "Project not found",
        variant: "destructive",
      });
      return;
    }

    if (!sellId) {
      toast({
        title: "Error",
        description: "VarientId not",
        variant: "destructive",
      });
      return;
    }

    try {
      const res = await addProductVarientId(project.id, sellId);
      if (res.status !== 200) {
        throw new Error("Unable to add product varient id");
      }

      toast({
        title: "Success",
        description: "Template published successfully",
        variant: "default",
      });
      // console.log("Template published successfully", res.data);
      if (res.data) {
        setProject(res.data);
      }
    } catch (error) {
      console.error("🔴 ERROR", error);
      toast({
        title: "Error",
        description: "Unable to publish template",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetApiKey = async () => {
    setIsLoading(true);

    try {
      const res = await addLemonSqueezyApiKey(apiKey, storeId, webhookSecret);
      if (res.status !== 200) {
        throw new Error("Unable to add API Key");
      }

      toast({
        title: "Success",
        description: "API Key added successfully",
        variant: "default",
      });
      setShowPublish(true);
    } catch (error) {
      console.error("🔴 ERROR", error);
      toast({
        title: "Error",
        description: "Unable to add API Key",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const {currentTheme} = useSlideStore();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" style={{
           backgroundColor: currentTheme.backgroundColor,
        }}>
          <WalletCards className="h-6 w-6" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          {project?.isSellable ? (
            <>
              <h2 className="text-lg font-semibold text-green-600">
                Congratulations!
              </h2>
              <p>Your template has been published successfully.</p>
              <Button asChild className="w-full">
                <Link href="/templates">View in Template Store</Link>
              </Button>
            </>
          ) : showPublish ? (
            <>
              <h2 className="text-lg font-semibold">Publish Template</h2>

              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="Enter your varient Id"
                  value={sellId}
                  onChange={(e) => setSellId(e.target.value)}
                />
                <Button
                  className="w-full"
                  onClick={handlePublish}
                  disabled={isLoading || !sellId}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    "Publish Template"
                  )}
                </Button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold">Set API Key</h2>
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Enter your API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />

                <Input
                  type="password"
                  placeholder="Enter your Store key"
                  value={storeId}
                  onChange={(e) => setStoreId(e.target.value)}
                />

                <Input
                  type="password"
                  placeholder="Enter your WebhookSecret key"
                  value={webhookSecret}
                  onChange={(e) => setWebhookSecret(e.target.value)}
                />
                <Button
                  className="w-full"
                  onClick={handleSetApiKey}
                  disabled={isLoading || !apiKey || !storeId}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Setting API Key...
                    </>
                  ) : (
                    "Set API Key"
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
