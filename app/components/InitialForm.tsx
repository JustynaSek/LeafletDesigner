"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoginButton } from "./LoginButton";

interface InitialFormProps {
  onStartConversation: (initialData: {
    product: string;
    details: string;
    targetAudience: string;
    contactInfo: string;
    leafletSize: string;
  }) => void;
  isLoading: boolean;
}

export function InitialForm({
  onStartConversation,
  isLoading,
}: InitialFormProps) {
  const [product, setProduct] = useState("");
  const [details, setDetails] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [leafletSize, setLeafletSize] = useState("standard");
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const { status: sessionStatus } = useSession();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = {
      product,
      details,
      targetAudience,
      contactInfo,
      leafletSize,
    };

    if (sessionStatus === "unauthenticated") {
      localStorage.setItem("pendingLeafletData", JSON.stringify(formData));
      setShowLoginPrompt(true);
    } else {
      onStartConversation(formData);
    }
  };

  if (showLoginPrompt) {
    return (
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Please Sign In
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          You need to be signed in to generate a leaflet. Your form data has
          been saved.
        </p>
        <div className="max-w-xs mx-auto">
         <LoginButton isPrimary={false} />
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-6"
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          AI-Powered Leaflet Generator
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Fill out the details below. You can refine the content with our AI assistant in the next step.
        </p>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="product">Product/Service Name</Label>
          <Input
            id="product"
            placeholder="e.g. 'Artisanal Coffee'"
            value={product}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setProduct(e.target.value)
            }
            required
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="details">Product/Service Details</Label>
          <Textarea
            id="details"
            placeholder="e.g. 'Organic, single-origin beans, roasted locally. Special offer: 20% off for new customers.'"
            value={details}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setDetails(e.target.value)
            }
            required
            className="w-full"
            rows={3}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="targetAudience">Target Audience</Label>
          <Input
            id="targetAudience"
            placeholder="e.g., 'University Students', 'Local Families'"
            value={targetAudience}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setTargetAudience(e.target.value)
            }
            required
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactInfo">Contact Information</Label>
          <Textarea
            id="contactInfo"
            placeholder="e.g., website.com, 555-123-4567, 123 Main St"
            value={contactInfo}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setContactInfo(e.target.value)
            }
            required
            className="w-full"
            rows={2}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="leaflet-size">Leaflet Size</Label>
          <Select
            onValueChange={setLeafletSize}
            defaultValue={leafletSize}
            name="leaflet-size"
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Standard (8.5" x 11")</SelectItem>
              <SelectItem value="half_sheet">
                Half Sheet (5.5" x 8.5")
              </SelectItem>
              <SelectItem value="dl_envelope">
                DL Envelope (3.9" x 8.3")
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Starting..." : "Start Conversation"}
      </Button>

      {sessionStatus === 'unauthenticated' && (
        <>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                  Or
                </span>
              </div>
            </div>
            <LoginButton isPrimary={false} />
        </>
      )}
    </form>
  );
}
