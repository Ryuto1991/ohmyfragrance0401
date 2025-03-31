"use client"

import React, { useState, useEffect, Suspense, useCallback } from 'react'; // Added useCallback
import { useSearchParams } from 'next/navigation';
import Footer from "@/components/site-footer";
import Header from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Image from "next/image";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { createBrowserClient } from '@supabase/ssr'; // Import client creator

// Define the structure of the fragrance data we expect from Supabase
interface FragranceData {
  id: string;
  session_id: string;
  name: string;
  concept: string;
  top_note: string;
  middle_note: string;
  base_note: string;
  bottle_shape?: string | null; // Make optional if not always present
  label_image_url?: string | null; // Make optional
  created_at: string;
}

// Wrap the main component logic to use useSearchParams
function CustomizePageContent() {
  const searchParams = useSearchParams();
  const fragranceId = searchParams.get('id');

  const [selectedBottle, setSelectedBottle] = useState<string>("round");
  const [fragranceName, setFragranceName] = useState<string>("");
  const [labelImage, setLabelImage] = useState<File | null>(null);
  const [fragranceData, setFragranceData] = useState<FragranceData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize Supabase client (browser)
  // Ensure these environment variables are exposed to the browser (prefixed with NEXT_PUBLIC_)
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Function to fetch fragrance data
  const fetchFragranceData = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    console.log('Fetching fragrance data for ID:', id);

    try {
      const { data, error: fetchError } = await supabase
        .from('fragrances')
        .select('*') // Select all columns for now
        .eq('id', id)
        .single(); // Expecting only one result

      if (fetchError) {
        console.error('Supabase fetch error:', fetchError);
        throw new Error(`データの取得に失敗しました: ${fetchError.message}`);
      }

      if (data) {
        console.log('Fetched data:', data);
        setFragranceData(data as FragranceData);
        setFragranceName(data.name || ""); // Set name from fetched data
        // Optionally set bottle shape if it exists
        if (data.bottle_shape) {
            setSelectedBottle(data.bottle_shape);
        }
      } else {
        throw new Error('指定されたIDの香りデータが見つかりません。');
      }
    } catch (err) {
      console.error('Error fetching fragrance:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('不明なエラーが発生しました。');
      }
      setFragranceData(null);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]); // Add supabase to dependency array

  // Fetch data when fragranceId changes
  useEffect(() => {
    if (fragranceId) {
      fetchFragranceData(fragranceId);
    } else {
      // Handle case where ID is missing or invalid
      setError("URLに香りのIDが含まれていません。");
      setIsLoading(false);
    }
  }, [fragranceId, fetchFragranceData]); // Include fetchFragranceData

  const handleSaveDraft = () => {
    // Logic to save draft will be implemented later
    console.log("Saving draft...", { fragranceId, fragranceName, selectedBottle, labelImage });
    alert("下書きとして保存しました。（機能は未実装です）")
  }

  const handleCheckout = () => {
    // Stripe checkout flow will be implemented later
    console.log("Proceeding to checkout...", { fragranceId, fragranceName, selectedBottle });
    alert("注文処理を開始します。（機能は未実装です）")
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLabelImage(e.target.files[0])
    }
  }

  // Display loading state
  if (isLoading) {
    return <div className="container mx-auto px-4 py-12 text-center">読み込み中...</div>;
  }

  // Display error state
  if (error) {
    return <div className="container mx-auto px-4 py-12 text-center text-red-600">エラー: {error}</div>;
  }

  // Display message if no data found (although error state might cover this)
  if (!fragranceData) {
    return <div className="container mx-auto px-4 py-12 text-center">香りデータが見つかりません。</div>;
  }

  // Main content when data is loaded
  return (
    <main className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Header Section */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">あなたの香りが完成しました</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
          最後の仕上げをして、世界に一つのフレグランスを完成させましょう。
        </p>
      </div>

      {/* Display Fetched Fragrance Details */}
      <Card className="mb-8 bg-gradient-to-r from-purple-100 via-pink-100 to-red-100 dark:from-purple-900 dark:via-pink-900 dark:to-red-900">
        <CardHeader>
          <CardTitle className="text-2xl">{fragranceData.name || "名前未設定の香り"}</CardTitle>
          <CardDescription>{fragranceData.concept || "コンセプト未設定"}</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="font-semibold">トップノート:</p>
            <p>{fragranceData.top_note}</p>
          </div>
          <div>
            <p className="font-semibold">ミドルノート:</p>
            <p>{fragranceData.middle_note}</p>
          </div>
          <div>
            <p className="font-semibold">ベースノート:</p>
            <p>{fragranceData.base_note}</p>
          </div>
        </CardContent>
      </Card>

      {/* Customization Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <form className="space-y-8">
          {/* Fragrance Name Input - Now potentially pre-filled */}
          <div className="space-y-2">
            <Label htmlFor="fragrance-name" className="text-lg">
              香水の名前（変更可）
            </Label>
            <Input
              id="fragrance-name"
              placeholder="例：Eternal Blossom"
              value={fragranceName} // Controlled by state, updated from fetched data
              onChange={(e) => setFragranceName(e.target.value)}
              className="max-w-md"
            />
          </div>

          {/* Bottle Selection */}
          <div className="space-y-4">
            <Label className="text-lg block mb-4">ボトルの形を選んでください</Label>
            <RadioGroup
              value={selectedBottle}
              onValueChange={setSelectedBottle}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {/* Radio items remain the same, ensure values match potential DB values */}
               <div className="relative">
                 <RadioGroupItem value="round" id="bottle-round" className="sr-only" />
                 <Label
                   htmlFor="bottle-round"
                   className={`flex flex-col items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                     selectedBottle === "round" ? "border-primary bg-primary/10" : "border-gray-200 dark:border-gray-700"
                   }`}
                 >
                   <Image
                     src="/images/bottles/round.png"
                     alt="Round Bottle"
                     width={100}
                     height={150}
                     className="mb-2"
                   />
                   <span>ラウンド</span>
                 </Label>
               </div>

               <div className="relative">
                 <RadioGroupItem value="square" id="bottle-square" className="sr-only" />
                 <Label
                   htmlFor="bottle-square"
                   className={`flex flex-col items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                     selectedBottle === "square" ? "border-primary bg-primary/10" : "border-gray-200 dark:border-gray-700"
                   }`}
                 >
                   <Image
                     src="/images/bottles/square.png"
                     alt="Square Bottle"
                     width={100}
                     height={150}
                     className="mb-2"
                   />
                   <span>スクエア</span>
                 </Label>
               </div>

               <div className="relative">
                 <RadioGroupItem value="oval" id="bottle-oval" className="sr-only" />
                 <Label
                   htmlFor="bottle-oval"
                   className={`flex flex-col items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                     selectedBottle === "oval" ? "border-primary bg-primary/10" : "border-gray-200 dark:border-gray-700"
                   }`}
                 >
                   <Image
                     src="/images/bottles/oval.png"
                     alt="Oval Bottle"
                     width={100}
                     height={150}
                     className="mb-2"
                   />
                   <span>オーバル</span>
                 </Label>
               </div>

               <div className="relative">
                 <RadioGroupItem value="vintage" id="bottle-vintage" className="sr-only" />
                 <Label
                   htmlFor="bottle-vintage"
                   className={`flex flex-col items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                     selectedBottle === "vintage" ? "border-primary bg-primary/10" : "border-gray-200 dark:border-gray-700"
                   }`}
                 >
                   <Image
                     src="/images/bottles/vintage.png"
                     alt="Vintage Bottle"
                     width={100}
                     height={150}
                     className="mb-2"
                   />
                   <span>ヴィンテージ</span>
                 </Label>
               </div>
            </RadioGroup>
          </div>

          {/* Label Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="label-image" className="text-lg">
              ラベルの画像（オプション）
            </Label>
            <Input
              id="label-image"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="max-w-md"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              JPG、PNG形式の画像をアップロードできます。
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveDraft}
              className="flex-1"
            >
              下書きとして保存
            </Button>
            <Button
              type="button"
              onClick={handleCheckout}
              className="flex-1"
            >
              注文に進む
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}

// Export the page component
export default function FragranceAICustomizePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Suspense fallback={<div>Loading...</div>}>
        <CustomizePageContent />
      </Suspense>
      <Footer />
    </div>
  );
}
