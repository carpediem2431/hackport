import LanyardProfile from "@/components/react-bits/lanyard-profile";
import ReflectiveCard from "@/components/ReflectiveCard";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";

const profile = {
  name: "HackPort User",
  role: "Frontend / Product Builder",
  stacks: ["Next.js", "TypeScript", "OpenAI", "shadcn/ui"],
  collaboration: "Fast feedback, shipping-oriented",
  status: "Dummy signed-in profile",
};

export default function MyPage() {
  return (
    <div className="container-shell py-16 sm:py-20">
      <SectionHeading
        eyebrow="My Profile"
        title="마이페이지"
        description="더미 로그인 상태를 가정하고, 프로필 정보와 React Bits 스타일 인터랙티브 카드를 함께 보여주는 페이지입니다."
      />

      <div className="mt-10 grid gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <div className="space-y-6">
          <Card className="surface-tint">
            <div className="mb-4 flex flex-wrap gap-2">
              <Badge>Dummy Login</Badge>
              <Badge>Profile Ready</Badge>
            </div>
            <CardTitle className="text-3xl">{profile.name}</CardTitle>
            <CardDescription className="mt-3 text-base">{profile.status}</CardDescription>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[24px] bg-white/70 p-5">
                <p className="text-sm text-muted">Role</p>
                <p className="mt-2 font-medium">{profile.role}</p>
              </div>
              <div className="rounded-[24px] bg-white/70 p-5">
                <p className="text-sm text-muted">Collaboration</p>
                <p className="mt-2 font-medium">{profile.collaboration}</p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {profile.stacks.map((stack) => (
                <Badge key={stack}>{stack}</Badge>
              ))}
            </div>
          </Card>

          <div style={{ height: "600px", position: "relative" }}>
            <ReflectiveCard
              overlayColor="rgba(0, 0, 0, 0.2)"
              blurStrength={12}
              glassDistortion={30}
              metalness={1}
              roughness={0.75}
              displacementStrength={20}
              noiseScale={1}
              specularConstant={5}
              grayscale={0.15}
              color="#000000"
              className="h-full w-full"
            />
          </div>
        </div>

        <Card className="surface-tint overflow-hidden p-0">
          <div className="border-b border-border/70 px-6 py-5">
            <CardTitle>Lanyard</CardTitle>
            <CardDescription className="mt-2">
              마이페이지 진입 후 위쪽에서 떨어져 안정화되는 인터랙티브 ID 카드입니다.
            </CardDescription>
          </div>
          <LanyardProfile />
        </Card>
      </div>
    </div>
  );
}
