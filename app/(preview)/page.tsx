"use client";

import { useState } from "react";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import {  keywordAnalysisSchema } from "@/lib/schemas";
import { toast } from "sonner";
import { FileUp, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import NextLink from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { VercelIcon, GitIcon } from "@/components/icons";

export default function ChatWithFiles() {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [jobDescription, setJobDescription] = useState<string>("");

const {
    submit,
    object: keywordAnalysis,
    isLoading,
  } = useObject({
    api: "/api/analyze-resume",
    schema: keywordAnalysisSchema,
    initialValue: undefined,
    onError: (error) => {
      toast.error("Failed to generate report. Please try again.");
      setFiles([]);
      setJobDescription("");
    },
    onFinish: (data) => {
      
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    if (isSafari && isDragging) {
      toast.error(
        "Safari does not support drag & drop. Please use the file picker.",
      );
      return;
    }

    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter(
      (file) => file.type === "application/pdf" && file.size <= 5 * 1024 * 1024,
    );

    if (validFiles.length !== selectedFiles.length) {
      toast.error("Only PDF files under 5MB are allowed.");
    }

    setFiles(validFiles);
  };

  const encodeFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmitWithFiles = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const encodedFiles = await Promise.all(
      files.map(async (file) => ({
        name: file.name,
        type: file.type,
        data: await encodeFileAsBase64(file),
      })),
    );
    submit({ files: encodedFiles, jobDescription: jobDescription  });
  };

  const clearPDF = () => {
    setFiles([]);
    setJobDescription('');
  };


  if (keywordAnalysis) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Resume Analysis Results</CardTitle>
            <CardDescription>Based on the provided job description</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Matching Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {keywordAnalysis.matchingKeywords?.map((keyword, index) => (
                  <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded">
                    {keywordAnalysis.matchingKeywords?.length == 0 ? 'No Keywords Matched' : keyword}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Missing Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {keywordAnalysis.missingKeywords?.map((keyword, index) => (
                  <span key={index} className="px-2 py-1 bg-red-100 text-red-800 rounded">
                    {keywordAnalysis.missingKeywords?.length === 0 ? 'All Keywords Matched' : keyword}
                  </span>
                ))}
              </div>
              <Button
                onClick={() => {
                  const keywords = keywordAnalysis.missingKeywords?.join(', ') ?? '';
                  navigator.clipboard.writeText(keywords).then(() => {
                    toast.success('Missing keywords copied to clipboard!');
                  }).catch(() => {
                    toast.error('Failed to copy keywords to clipboard');
                  });
                }}
                variant="outline"
                className="mt-4"
                size="sm"
              >
                Copy Missing Keywords
              </Button>
            </div>
            <Button onClick={clearPDF} className="w-full mt-4">
              Analyze Another Resume
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="min-h-[100dvh] w-full flex justify-center"
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragExit={() => setIsDragging(false)}
      onDragEnd={() => setIsDragging(false)}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileChange({
          target: { files: e.dataTransfer.files },
        } as React.ChangeEvent<HTMLInputElement>);
      }}
    >
      <AnimatePresence>
        {isDragging && (
          <motion.div
            className="fixed pointer-events-none dark:bg-zinc-900/90 h-dvh w-dvw z-10 justify-center items-center flex flex-col gap-1 bg-zinc-100/90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div>Drag and drop files here</div>
            <div className="text-sm dark:text-zinc-400 text-zinc-500">
              {"(PDFs only)"}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <Card className="w-full max-w-md h-full border-0 sm:border sm:h-fit mt-12">
        <CardHeader className="text-center space-y-6">
          <div className="mx-auto flex items-center justify-center space-x-2 text-muted-foreground">
            <div className="rounded-full bg-primary/10 p-2">
              <FileUp className="h-6 w-6" />
            </div>
            <Plus className="h-4 w-4" />
            <div className="rounded-full bg-primary/10 p-2">
              <Loader2 className="h-6 w-6" />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold">
              Resume Checker AI
            </CardTitle>
            <CardDescription className="text-base">
              Land More Interviews With My FREE ATS Resume Checker Using AI.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitWithFiles} className="space-y-4">
            <div className="space-y-4">
              <div
                className={`relative flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 transition-colors hover:border-muted-foreground/50`}
              >
              <input
                type="file"
                onChange={handleFileChange}
                accept="application/pdf"
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <FileUp className="h-8 w-8 mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground text-center">
                {files.length > 0 ? (
                  <span className="font-medium text-foreground">
                    {files[0].name}
                  </span>
                ) : (
                  <span>Drop your PDF here or click to browse.</span>
                )}
              </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Job Description</label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description here..."
                  className="w-full min-h-[150px] p-3 rounded-md border border-input bg-background text-sm resize-y"
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={files.length === 0 || !jobDescription}
            >
              {isLoading ? (
                <span className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Analyzing Resume...</span>
                </span>
              ) : (
                "Analyze Resume"
              )}
            </Button>
          </form>
        </CardContent>
        {isLoading && (
          <CardFooter className="flex flex-col space-y-4">
            <div className="w-full space-y-2">
              <div className="grid grid-cols-6 sm:grid-cols-4 items-center space-x-2 text-sm">
                <div
                  className={`h-2 w-2 rounded-full ${
                    isLoading ? "bg-yellow-500/50 animate-pulse" : "bg-muted"
                  }`}
                />
                <span className="text-muted-foreground text-center col-span-4 sm:col-span-2">
                 Generating Detailed Report Please Wait...
                </span>
              </div>
            </div>
          </CardFooter>
        )}
      </Card>
      <motion.div
        className="flex flex-row gap-4 items-center justify-between fixed bottom-6 text-xs "
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <NextLink
          target="_blank"
          href="https://github.com/sabiehahmed10p"
          className="flex flex-row gap-2 items-center border px-2 py-1.5 rounded-md hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-800"
        >
          <GitIcon />
          Visit Github
        </NextLink>

        <NextLink
          target="_blank"
          href="https://sabiehahmed.com"
          className="flex flex-row gap-2 items-center bg-zinc-900 px-2 py-1.5 rounded-md text-zinc-50 hover:bg-zinc-950 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-50"
        >
          <VercelIcon size={14} />
          Made with ❤️ by Sabieh
        </NextLink>
      </motion.div>
    </div>
  );
}
