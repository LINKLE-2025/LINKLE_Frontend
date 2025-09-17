export {};

declare global {
  interface Window {
    kakao: typeof kakao;
  }

  namespace kakao {
    namespace maps {
      function load(callback: () => void): void;

      class Map {
        constructor(container: HTMLElement, options: object);
        setLevel(level: number): void;
        getLevel(): number;
        getCenter(): LatLng;
        panTo(latlng: LatLng): void;
      }

      class LatLng {
        constructor(lat: number, lng: number);
        getLat(): number;
        getLng(): number;
      }

      class Marker {
        constructor(options: object);
        setMap(map: Map | null): void;
      }

      class MarkerImage {
        constructor(src: string, size: Size, options?: object);
      }

      class Size {
        constructor(width: number, height: number);
      }

      class Point {
        constructor(x: number, y: number);
      }

      class Circle {
        constructor(options: object);
        setMap(map: Map | null): void;
      }

      namespace services {
        class Geocoder {
          coord2Address(
            x: number,
            y: number,
            callback: (
              result: {
                road_address?: { address_name: string };
                address?: { address_name: string };
              }[],
              status: string,
            ) => void,
          ): void;
        }
        interface PlaceSearchResult {
          id: string;
          place_name: string;
          address_name: string;
          road_address_name: string;
          phone: string;
          x: string; // 경도
          y: string; // 위도
          [key: string]: unknown; // 기타 필드 허용
        }

        interface Pagination {
          current: number;
          last: number;
          totalCount: number;
          hasNextPage: boolean;
        }

        class Places {
          keywordSearch(
            keyword: string,
            callback: (result: PlaceSearchResult[], status: string, pagination: Pagination) => void,
            options?: object,
          ): void;
        }
        const Status: { OK: string };
      }

      namespace event {
        interface MouseEvent {
          latLng: LatLng;
        }
        type EventTarget = Map | Marker | Circle;
        type EventHandler = (...args: unknown[]) => void;

        function addListener(target: EventTarget, type: string, handler: EventHandler): void;
      }
    }
  }
}
