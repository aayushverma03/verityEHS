// FAQ page for Verity EHS
"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { Nav } from "@/components/nav"
import { useLanguage } from "@/components/language-provider"
import { cn } from "@/lib/utils"

type FAQKey = "q1" | "q2" | "q3" | "q4" | "q5" | "q6" | "q7" | "q8"
type AnswerKey = "a1" | "a2" | "a3" | "a4" | "a5" | "a6" | "a7" | "a8"

const faqKeys: Array<{ q: FAQKey; a: AnswerKey }> = [
  { q: "q1", a: "a1" },
  { q: "q2", a: "a2" },
  { q: "q3", a: "a3" },
  { q: "q4", a: "a4" },
  { q: "q5", a: "a5" },
  { q: "q6", a: "a6" },
  { q: "q7", a: "a7" },
  { q: "q8", a: "a8" },
]

export default function FAQPage() {
  const { t } = useLanguage()
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <>
      <Nav />
      <main className="page-container">
        <div className="max-w-3xl mx-auto pt-16 md:pt-8">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="section-title mb-3">{t.faq.title}</h1>
            <p className="text-stone-500">{t.faq.subtitle}</p>
          </div>

          {/* FAQ Accordion */}
          <div className="space-y-3">
            {faqKeys.map((item, index) => {
              const isOpen = openIndex === index
              return (
                <div
                  key={item.q}
                  className={cn(
                    "bg-white border border-stone-200 rounded-xl overflow-hidden transition-all duration-200",
                    isOpen && "shadow-md border-stone-300"
                  )}
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="w-full flex items-center justify-between p-5 text-left"
                  >
                    <span className="font-medium text-stone-800 pr-4">
                      {t.faq[item.q]}
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-5 w-5 text-stone-400 flex-shrink-0 transition-transform duration-200",
                        isOpen && "rotate-180 text-teal-700"
                      )}
                    />
                  </button>
                  <div
                    className={cn(
                      "grid transition-all duration-200",
                      isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    )}
                  >
                    <div className="overflow-hidden">
                      <div className="px-5 pb-5 pt-0">
                        <div className="h-px bg-stone-200 mb-4" />
                        <p className="text-stone-600 leading-relaxed">
                          {t.faq[item.a]}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </main>
    </>
  )
}
