import { deleteUser } from "@/api/profileApi";
import type { ProfileDTO } from "@/types/user";

interface ProfileFormProps {
  userId: number;
  profileData: ProfileDTO;
  updateField: (field: keyof ProfileDTO, value: string) => void;
}

interface ProfileInputRowProps {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  as?: "input" | "select" | "textarea";
  options?: string[];
  readOnly?: boolean;
}

function ProfileInputRow({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  as = "input",
  options = [],
  readOnly = false,
}: ProfileInputRowProps) {
  return (
    <div className="flex justify-between items-start border-b pb-2 max-w-full">
      <label className="text-gray-500 text-sm pt-1">{label}</label>
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
      ) : as === "textarea" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="text-right text-sm text-gray-800 focus:outline-none w-2/3 resize-none bg-transparent"
          rows={2}
        />
      ) : (
        <input
          type={type}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="text-right text-base text-gray-800 focus:outline-none w-2/3 bg-transparent"
          placeholder={placeholder}
          readOnly={readOnly}
        />
      )}
    </div>
  );
}


function ProfileForm({ userId, profileData, updateField }: ProfileFormProps) {
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
          readOnly
        />

        {/* <ProfileInputRow
          label="비밀번호"
          type="password"
          value={profileData.password ?? ""}
          onChange={(v) => updateField("password", v)}
          placeholder="********"
        /> */}

        <ProfileInputRow
          label="닉네임"
          value={profileData.nickname}
          onChange={(v) => updateField("nickname", v)}
        />

        <ProfileInputRow
          label="성별"
          value={profileData.gender}
          onChange={(v) => updateField("gender", v)}
          // as="select"
          // options={["남성", "여성"]}
          readOnly
        />

        <ProfileInputRow
          label="소개"
          value={profileData.memo}
          onChange={(v) => updateField("memo", v)}
          as="textarea"
        />

        <ProfileInputRow
          label="이메일"
          type="email"
          value={profileData.email}
          onChange={(v) => updateField("email", v)}
          readOnly
        />
      </div>

      {/* 회원탈퇴 버튼 */}
      <div className="text-right">
        <button
          className="text-red-500 text-sm font-medium hover:text-red-700"
          onClick={async () => {
            if (confirm("정말 탈퇴하시겠습니까?")) {
              try {
                await deleteUser(userId); // ✅ 여기서 직접 호출
                alert("회원 탈퇴가 완료되었습니다.");
                // 로그아웃 처리 및 메인 페이지로 이동
                window.location.href = "/";
              } catch (err) {
                console.error("회원 탈퇴 실패:", err);
                alert("회원 탈퇴 중 오류가 발생했습니다.");
              }
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
