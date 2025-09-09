import type { ProfileDTO } from "@/types/user";

interface ProfileFormProps {
  profileData: ProfileDTO;
  updateField: (field: keyof ProfileDTO, value: string) => void;
}

interface ProfileInputRowProps {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  as?: "input" | "select";
  options?: string[];
}

function ProfileInputRow({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  as = "input",
  options = [],
}: ProfileInputRowProps) {
  return (
    <div className="flex justify-between items-center border-b pb-2">
      <label className="text-gray-500 text-sm">{label}</label>
      {as === "select" ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="text-right text-sm text-gray-800 focus:outline-none w-2/3 bg-transparent"
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="text-right text-sm text-gray-800 focus:outline-none w-2/3"
          placeholder={placeholder}
        />
      )}
    </div>
  );
}

function ProfileForm({ profileData, updateField }: ProfileFormProps) {
  return (
    <div className="bg-white rounded-xl shadow p-4 space-y-6">
      {/* 기본 정보 변경 제목 */}
      <h2 className="text-center text-gray-800 font-semibold text-lg border-b pb-2">
        기본 정보 변경
      </h2>

      {/* 입력 필드 목록 */}
      <div className="space-y-4">
        <ProfileInputRow
          label="이름"
          value={profileData.name}
          onChange={(v) => updateField("name", v)}
        />

        <ProfileInputRow
          label="비밀번호"
          type="password"
          value={profileData.password ?? ""}
          onChange={(v) => updateField("password", v)}
          placeholder="********"
        />

        <ProfileInputRow
          label="닉네임"
          value={profileData.nickname}
          onChange={(v) => updateField("nickname", v)}
        />

        <ProfileInputRow
          label="성별"
          value={profileData.gender}
          onChange={(v) => updateField("gender", v)}
          as="select"
          options={["남성", "여성"]}
        />

        <ProfileInputRow
          label="소개"
          value={profileData.intro}
          onChange={(v) => updateField("intro", v)}
        />

        <ProfileInputRow
          label="이메일"
          type="email"
          value={profileData.email}
          onChange={(v) => updateField("email", v)}
        />
      </div>

      {/* 회원탈퇴 버튼 */}
      <div className="text-right">
        <button
          className="text-red-500 text-sm font-medium hover:text-red-700"
          onClick={() => {
            if (confirm("정말 탈퇴하시겠습니까?")) {
              // TODO: 회원탈퇴 로직 추가
            }
          }}
        >
          회원탈퇴
        </button>
      </div>
    </div>
  );
}

export default ProfileForm;
