"use client";
/* eslint-disable react-hooks/static-components */

import { useMDXComponent } from "next-contentlayer2/hooks";
import { blogV2MdxComponents } from "@/lib/blog-v2/mdx-components";

type BlogArticleMdxProps = {
  code: string;
};

export function BlogArticleMdx({ code }: BlogArticleMdxProps) {
  const Component = useMDXComponent(code);
  return (
    <div className="space-y-6">
      <Component components={blogV2MdxComponents} />
    </div>
  );
}
