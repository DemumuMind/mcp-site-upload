"use client";

import { FolderTree, KeyRound, Languages, Search } from "lucide-react";

import { useLocale } from "@/components/locale-provider";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { tr } from "@/lib/i18n";
import type { AuthType } from "@/lib/types";

type CatalogFilterBarProps = {
  searchQuery: string;
  categoryFilter: string;
  languageFilter: string;
  authFilter: AuthType | "all";
  categories: string[];
  languages: string[];
  onSearchQueryChange: (value: string) => void;
  onCategoryFilterChange: (value: string) => void;
  onLanguageFilterChange: (value: string) => void;
  onAuthFilterChange: (value: AuthType | "all") => void;
};

export function CatalogFilterBar({
  searchQuery,
  categoryFilter,
  languageFilter,
  authFilter,
  categories,
  languages,
  onSearchQueryChange,
  onCategoryFilterChange,
  onLanguageFilterChange,
  onAuthFilterChange,
}: CatalogFilterBarProps) {
  const locale = useLocale();

  const authFilterOptions: Array<{ value: AuthType | "all"; label: string }> = [
    { value: "all", label: tr(locale, "All auth types", "Любой тип авторизации") },
    { value: "oauth", label: "OAuth" },
    { value: "api_key", label: "API Key" },
    { value: "none", label: tr(locale, "Open / No Auth", "Открытый / Без авторизации") },
  ];

  return (
    <div className="grid gap-3 rounded-2xl border border-white/10 bg-slate-900/60 p-4 shadow-[0_0_0_1px_rgba(148,163,184,0.06)] backdrop-blur md:grid-cols-[1fr_200px_200px_200px]">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={searchQuery}
          onChange={(event) => onSearchQueryChange(event.target.value)}
          placeholder={tr(
            locale,
            "Search servers, categories, tags, tools...",
            "Поиск по серверам, категориям, тегам и инструментам...",
          )}
          className="border-white/10 bg-slate-950/80 pl-9 text-slate-100 placeholder:text-slate-500"
        />
      </div>

      <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
        <SelectTrigger className="border-white/10 bg-slate-950/80 text-slate-200">
          <div className="flex items-center gap-2">
            <FolderTree className="size-4 text-slate-400" />
            <SelectValue placeholder={tr(locale, "Categories", "Категории")} />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{tr(locale, "All Categories", "Все категории")}</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category} value={category}>
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={languageFilter} onValueChange={onLanguageFilterChange}>
        <SelectTrigger className="border-white/10 bg-slate-950/80 text-slate-200">
          <div className="flex items-center gap-2">
            <Languages className="size-4 text-slate-400" />
            <SelectValue placeholder={tr(locale, "Languages", "Языки")} />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{tr(locale, "All Languages", "Все языки")}</SelectItem>
          {languages.map((language) => (
            <SelectItem key={language} value={language}>
              {language}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={authFilter}
        onValueChange={(value) => onAuthFilterChange(value as AuthType | "all")}
      >
        <SelectTrigger className="border-white/10 bg-slate-950/80 text-slate-200">
          <div className="flex items-center gap-2">
            <KeyRound className="size-4 text-slate-400" />
            <SelectValue placeholder={tr(locale, "Auth type", "Тип авторизации")} />
          </div>
        </SelectTrigger>
        <SelectContent>
          {authFilterOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
