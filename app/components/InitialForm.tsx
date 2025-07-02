'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface InitialFormProps {
  onStartConversation: (initialData: {
    product: string;
    details: string;
    targetAudience: string;
    contactInfo: string;
    leafletSize: string;
    leafletStyle: string;
    colorScheme: string;
  }) => void;
  isLoading: boolean;
  initialData?: {
    product: string;
    details: string;
    targetAudience: string;
    contactInfo: string;
    leafletSize: string;
    leafletStyle: string;
    colorScheme: string;
  } | null;
}

export function InitialForm({
  onStartConversation,
  isLoading,
  initialData,
}: InitialFormProps) {
  const [product, setProduct] = useState(initialData?.product || '');
  const [details, setDetails] = useState(initialData?.details || '');
  const [targetAudience, setTargetAudience] = useState(initialData?.targetAudience || '');
  const [contactInfo, setContactInfo] = useState(initialData?.contactInfo || '');
  const [leafletSize, setLeafletSize] = useState(initialData?.leafletSize || 'standard');
  const [leafletStyle, setLeafletStyle] = useState(initialData?.leafletStyle || 'modern');
  const [colorScheme, setColorScheme] = useState(initialData?.colorScheme || 'blue');
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const { status: sessionStatus } = useSession();

  // Update form fields when initialData changes (e.g., when returning to form)
  useEffect(() => {
    if (initialData) {
      setProduct(initialData.product || '');
      setDetails(initialData.details || '');
      setTargetAudience(initialData.targetAudience || '');
      setContactInfo(initialData.contactInfo || '');
      setLeafletSize(initialData.leafletSize || 'standard');
      setLeafletStyle(initialData.leafletStyle || 'modern');
      setColorScheme(initialData.colorScheme || 'blue');
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = {
      product,
      details,
      targetAudience,
      contactInfo,
      leafletSize,
      leafletStyle,
      colorScheme,
    };

    if (sessionStatus === 'unauthenticated') {
      localStorage.setItem('pendingLeafletData', JSON.stringify(formData));
      setShowLoginPrompt(true);
    } else {
      onStartConversation(formData);
    }
  };

  if (showLoginPrompt) {
    return (
      <div className='bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md text-center'>
        <h2 className='text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4'>
          Please Sign In
        </h2>
        <p className='text-gray-500 dark:text-gray-400 mb-6'>
          You need to be signed in to generate a leaflet. Your form data has
          been saved.
        </p>
        <div className='max-w-xs mx-auto'>
         &lt;LoginButton isPrimary={false} /&gt;
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className='bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-6'
    >
      <div className='space-y-2'>
        <h2 className='text-2xl font-bold text-gray-900 dark:text-gray-100'>
          {initialData ? 'Edit Your Leaflet Details' : 'AI-Powered Leaflet Generator'}
        </h2>
        <p className='text-gray-500 dark:text-gray-400'>
          {initialData 
            ? 'Review and modify your details below. You can continue refining with our AI assistant in the next step.'
            : 'Fill out the details below. You can refine the content with our AI assistant in the next step.'
          }
        </p>
      </div>
      <div className='space-y-4'>
        <div className='space-y-2'>
          <Label htmlFor='product'>Product/Service Name</Label>
          <Input
            id='product'
            placeholder='e.g. Artisanal Coffee'
            value={product}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setProduct(e.target.value)
            }
            required
            className='w-full'
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='details'>Product/Service Details</Label>
          <Textarea
            id='details'
            placeholder='e.g. Organic, single-origin beans, roasted locally. Special offer: 20% off for new customers.'
            value={details}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setDetails(e.target.value)
            }
            required
            className='w-full'
            rows={3}
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='targetAudience'>Target Audience</Label>
          <Input
            id='targetAudience'
            placeholder='e.g., University Students, Local Families'
            value={targetAudience}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setTargetAudience(e.target.value)
            }
            required
            className='w-full'
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='contactInfo'>Contact Information</Label>
          <Textarea
            id='contactInfo'
            placeholder='e.g., website.com, 555-123-4567, 123 Main St'
            value={contactInfo}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setContactInfo(e.target.value)
            }
            required
            className='w-full'
            rows={2}
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='leaflet-size'>Leaflet Size</Label>
          <Select
            onValueChange={setLeafletSize}
            defaultValue={leafletSize}
            name='leaflet-size'
          >
            <SelectTrigger>
              <SelectValue placeholder='Select a size' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='standard'>Standard (8.5&quot; x 11&quot;)</SelectItem>
              <SelectItem value='half_sheet'>Half Sheet (5.5&quot; x 8.5&quot;)</SelectItem>
              <SelectItem value='dl_envelope'>DL Envelope (3.9&quot; x 8.3&quot;)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className='space-y-2'>
          <Label htmlFor='leaflet-style'>Leaflet Style</Label>
          <Select
            onValueChange={setLeafletStyle}
            defaultValue={leafletStyle}
            name='leaflet-style'
          >
            <SelectTrigger>
              <SelectValue placeholder='Select a style' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='modern'>Modern</SelectItem>
              <SelectItem value='vintage'>Vintage</SelectItem>
              <SelectItem value='playful'>Playful</SelectItem>
              <SelectItem value='minimal'>Minimal</SelectItem>
              <SelectItem value='other'>Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className='space-y-2'>
          <Label htmlFor='color-scheme'>Color Scheme</Label>
          <Select
            onValueChange={setColorScheme}
            defaultValue={colorScheme}
            name='color-scheme'
          >
            <SelectTrigger>
              <SelectValue placeholder='Select a color scheme' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='blue'>Blue</SelectItem>
              <SelectItem value='green'>Green</SelectItem>
              <SelectItem value='red'>Red</SelectItem>
              <SelectItem value='custom'>Custom</SelectItem>
              <SelectItem value='other'>Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type='submit' disabled={isLoading} className='w-full'>
        {isLoading 
          ? 'Starting...' 
          : initialData 
            ? 'Update & Continue' 
            : 'Start Conversation'
        }
      </Button>

      {sessionStatus === 'unauthenticated' && (
        <>
            <div className='relative my-4'>
              <div className='absolute inset-0 flex items-center'>
                <span className='w-full border-t' />
              </div>
              <div className='relative flex justify-center text-xs uppercase'>
                <span className='bg-white px-2 text-gray-500 dark:bg-gray-800 dark:text-gray-400'>
                  Or
                </span>
              </div>
            </div>
            &lt;LoginButton isPrimary={false} /&gt;
        </>
      )}
    </form>
  );
}
