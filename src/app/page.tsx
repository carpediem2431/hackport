import Link from "next/link";
import { ArrowRight, Layers3, ShieldCheck, Trophy, Users2 } from "lucide-react";
import { FadeIn } from "@/components/react-bits/fade-in";
import Iridescence from "@/components/react-bits/iridescence";
import { TextType } from "@/components/react-bits/text-type";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";

const valueCards = [
  {
    title: "해커톤 코파일럿",
    body: "현재 상태를 기억하고 다음 행동을 바로 제안해 흐름이 끊기지 않게 만듭니다.",
    icon: Layers3,
  },
  {
    title: "팀 적합도 매칭",
    body: "역할, 스택, 협업 방식 기준으로 팀과의 적합도를 계산합니다.",
    icon: Users2,
  },
  {
    title: "제출 가드",
    body: "자동 저장, 검증, 공개/비공개 구분으로 제출 실수를 줄입니다.",
    icon: ShieldCheck,
  },
  {
    title: "설명 가능한 리더보드",
    body: "점수 분해와 배지, 변화 상태로 결과를 납득 가능하게 보여줍니다.",
    icon: Trophy,
  },
];

export default function HomePage() {
  return (
    <div className="relative isolate overflow-hidden">
      <Iridescence
        className="pointer-events-none fixed inset-0 z-0"
        color={[0.5, 0.6, 0.8]}
        speed={1}
        mouseReact={false}
      />
      <section className="relative z-10 overflow-hidden">
        <div className="container-shell relative flex min-h-[100svh] flex-col items-center justify-center py-20 sm:py-28">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)]">
            <div className="flex flex-col items-center text-center">
              <TextType
                as="h1"
                text={"여러분의 해커톤\n여정을 시작하세요."}
                loop={false}
                typingSpeed={100}
                initialDelay={150}
                showCursor={false}
                className="max-w-2xl font-display text-3xl font-semibold leading-[1.25] tracking-tight text-balance text-white sm:text-4xl lg:text-5xl"
              />

              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link href="/hackathons">
                  <Button size="lg">
                    가입하기
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/camp">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/30 bg-white/10 text-white shadow-[0_14px_28px_rgba(0,0,0,0.2)] hover:border-white/50 hover:bg-white/20"
                  >
                    팀 찾기
                  </Button>
                </Link>

              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-shell relative z-10 py-20">
        <div className="grid gap-5 lg:grid-cols-4">
          {valueCards.map((item, index) => (
            <FadeIn key={item.title} delay={index * 0.05}>
              <div className="h-full rounded-[20px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                <item.icon className="h-7 w-7 text-black" />
                <h3 className="mt-5 font-display text-2xl font-semibold text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/80">{item.body}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      <section className="container-shell relative z-10 py-20">
        <SectionHeading
          eyebrow="여정"
          title="해커톤 탐색 부터 팀 참여까지 쉽게"
          description=""
          eyebrowClassName="text-white/60"
          titleClassName="text-white"
          descriptionClassName="text-white/75"
        />
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {[
            "목록에서 해커톤을 고른 뒤 상세 페이지에서 일정, 평가, 제출 규칙을 한 번에 확인",
            "Camp에서 역할과 스택을 입력하고 적합도 높은 팀을 빠르게 탐색",
            "제출 가드로 초안을 저장하고 체크리스트를 통과한 뒤 안전하게 제출",
          ].map((item, index) => (
            <FadeIn key={item} delay={index * 0.1}>
              <div className="rounded-[20px] border border-white/10 bg-white/5 p-6 shadow-[0_16px_40px_rgba(82,39,255,0.08)] backdrop-blur-xl">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black font-semibold text-white">
                  0{index + 1}
                </div>
                <p className="text-pretty text-base leading-7 text-white/80">{item}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>
    </div>
  );
}
