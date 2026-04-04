import Link from "next/link";
import { ArrowRight, Layers3, ShieldCheck, Trophy, Users2 } from "lucide-react";
import { AnimatedText } from "@/components/react-bits/animated-text";
import { FadeIn } from "@/components/react-bits/fade-in";
import Grainient from "@/components/react-bits/grainient";
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
      <Grainient
        className="pointer-events-none fixed inset-0 z-0"
        color1="#b89eff"
        color2="#5227FF"
        color3="#B19EEF"
        grainAnimated={false}
        grainAmount={0.1}
        timeSpeed={0.25}
        warpStrength={1}
        zoom={0.9}
      />
      <section className="relative z-10 overflow-hidden">
        <div className="container-shell relative flex min-h-[100svh] flex-col justify-center py-20 sm:py-28">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)]">
            <div>
              <AnimatedText className="max-w-4xl font-display text-5xl font-semibold leading-[1.14] tracking-tight text-balance sm:text-6xl lg:text-7xl">
                해커톤의 시작부터 제출과 결과 해석까지, 한 흐름으로 연결합니다.
              </AnimatedText>
              <AnimatedText
                as="p"
                className="mt-6 max-w-xl text-pretty text-lg leading-8 text-black/85"
              >
                HackPort는 해커톤 탐색, 팀 매칭, 제출 준비, 리더보드 확인을 하나의 워크스페이스에 묶고, 브라우저 안에서 사용자의 진행 상태를 기억해 다음 행동을 안내합니다.
              </AnimatedText>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/hackathons">
                  <Button size="lg">
                    해커톤 보러가기
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/camp">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/80 bg-white/88 text-black shadow-[0_14px_28px_rgba(15,23,42,0.12)] hover:border-white hover:bg-white"
                  >
                    팀 찾기
                  </Button>
                </Link>
                <Link href="/rankings">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="border-brand-soft/70 bg-brand-soft/35 text-brand-strong shadow-[0_14px_28px_rgba(82,39,255,0.12)] hover:border-brand-soft hover:bg-brand-soft/50"
                  >
                    랭킹 보기
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
              <div className="surface-tint h-full rounded-[32px] border border-white/50 p-6 backdrop-blur-xl">
                <item.icon className="h-7 w-7 text-brand-strong" />
                <h3 className="mt-5 font-display text-2xl font-semibold text-black">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-black/80">{item.body}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      <section className="container-shell relative z-10 py-20">
        <SectionHeading
          eyebrow="여정"
          title="심사에서 바로 보여줄 수 있는 연결된 UX"
          description="탐색, 팀 구성, 제출, 결과 확인이 서로 끊기지 않도록 화면과 상태를 연결했습니다."
          eyebrowClassName="text-black/60"
          titleClassName="text-black"
          descriptionClassName="text-black/75"
        />
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {[
            "목록에서 해커톤을 고른 뒤 상세 페이지에서 일정, 평가, 제출 규칙을 한 번에 확인",
            "Camp에서 역할과 스택을 입력하고 적합도 높은 팀을 빠르게 탐색",
            "제출 가드로 초안을 저장하고 체크리스트를 통과한 뒤 안전하게 제출",
          ].map((item, index) => (
            <FadeIn key={item} delay={index * 0.1}>
              <div className="surface-tint rounded-[32px] border border-border p-6 shadow-[0_16px_40px_rgba(82,39,255,0.08)]">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-soft font-semibold text-brand-strong">
                  0{index + 1}
                </div>
                <p className="text-pretty text-base leading-7 text-black/80">{item}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>
    </div>
  );
}
