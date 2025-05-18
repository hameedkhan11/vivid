import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from 'lucide-react';
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { updateLemonSqueezyApiKey } from "@/actions/user";

const LemonKeyInput = ({lemonSqueezyApiKey}:{
  lemonSqueezyApiKey: string;
}) => {
  const [apiKey, setApiKey] = useState("");
  const [edit, setEdit] = useState(false);
  const {toast} = useToast();
  const [loading, setLoading] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    setApiKey(lemonSqueezyApiKey);
  }, [lemonSqueezyApiKey]);

  const handleEditSave = async () => {
    if (edit) {
      setLoading(true);
      
      // Simulated API call
      try{
        const res = await updateLemonSqueezyApiKey(apiKey);
        if(res.status !== 200){
          throw new Error("Unable to save API Key");
        }

        toast({
          title: "Success",
          description: "API Key saved successfully",
          variant: "default",
        });

        setApiKey(res.user?.lemonSqueezyApiKey || "");
      }catch(error){
        console.error("🔴 ERROR", error);
        toast({
          title: "Error",
          description: "Unable to save API Key",
          variant: "destructive",
        });
      }
      finally{
        setLoading(false);
      }
      
    }
    setShowApiKey(edit ? false : true);
    setEdit(!edit);
  };

  return (
    <div className="w-full space-y-2">
      <Label>API Key</Label>
      <div className="flex items-center gap-x-4">
        <div className="relative flex-grow">
          <Input
            type={showApiKey ? "text" : "password"}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            readOnly={!edit}
            className="pr-10"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
            onClick={() => setShowApiKey(!showApiKey)}
          >
            {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
        <Button
          variant="default"
          onClick={handleEditSave}
          disabled={loading}
          className="flex items-center gap-2"
        >
          {loading ? "Saving..." : edit ? "Save" : "Edit"}
        </Button>
      </div>
    </div>
  );
};

export default LemonKeyInput;

