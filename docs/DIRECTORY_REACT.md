# React 폴더 구조

## 기초 폴더 구조

```
    my-project
    ├── node_modules
    ├── public
    ├── src
    ├── .gitignore
    ├── package.json
    └── README.md
```

| 폴더/파일         | 설명                                                                     |
|---------------|------------------------------------------------------------------------|
| node_modules  | 현재 프로젝트에 포함된 라이브러리들의 리스트                                               |
| public        | index.html과 같은 정적 파일이 포함되는 곳으로 컴파일이 필요 없는 파일들이 위치하는 폴더                 |
| src           | 리액트 내부에서 작성하는 거의 모든 파일들이 폴더 내부에서 작성되며 이 폴더에 있는 파일들은 명령어에 따라 JS로 컴파일 진행 |
| .gitignore    | 깃에서 제외할 항목을 입력하는 파일                                                    |
| packages.json | 프로젝트에 관련된 기본적인 내용                                                      |
| README.md     | 깃에서 가장 먼저 띄워지는 창으로 주로 프로젝트의 기본 설명 포함                                   |

## src 내부 폴더 구조

```
  └─ src
   ├─ components
   ├─ assets 
   ├─ hooks (= hoc)
   ├─ pages
   ├─ constants
   ├─ config
   ├─ styles
   ├─ services (= api)
   ├─ utils
   ├─ contexts
   ├─ App.js
   └─ index.js
```

| 폴더/파일      | 설명                                                  |
|------------|-----------------------------------------------------|
| components | 재사용이 가능한 컴포넌트들이 위치하는 폴더                             |
| assets     | 이미지 or 폰트와 같은 파일들이 저장되는 폴더                          |
| hooks      | 커스텀 훅이 위치하는 폴더                                      |
| pages      | react router 등을 이용하여 라우팅을 적용할 때 페이지 컴포넌트를 이 폴더에 위치  |
| constants  | 공통적으로 사용되는 상수들을 정의한 파일들이 위치하는 폴더                    |
| config     | 여러개의 config 파일을 분리한 폴더                              |
| styles     | css 파일들이 포함되는 폴더                                    |
| services   | api 관련 로직의 모듈 파일이 위치하며 auth와 같은 인증과 관련된 파일을 모아두는 폴더 |
| utils      | 정규표현식 패턴이나 공통함수 등 공통으로 사용하는 유틸 파일들이 위치하는 폴더         |
| contexts   | contextAPI를 사용할 때 파일들이 위치하는 폴더<br/>                 |

- contextAPI 예시

```
import { createContext } from "react";
    
const LogContext = createContext('Hello');
    
export default LogContext;
```      

**참고링크**

- [React 폴더 구조 참조](https://velog.io/@sisofiy626/React-%EB%A6%AC%EC%95%A1%ED%8A%B8%EC%9D%98-%ED%8F%B4%EB%8D%94-%EA%B5%AC%EC%A1%B0)
  - 해당 링크를 참고하여 폴더 구조를 구성하였습니다.