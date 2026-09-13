import coursesJson from "../../data/Courses.json";

export interface Course {
  code: string;
  name: string;
  credit_hours: number;
  prerequisites: string[];
  type: string;
  description: string;
  id?: number;
}

export interface Major {
  title: string;
  major_requirements: {
    title: string;
    total_credit_hours: number;
    [key: string]: any;
  };
}

export interface CoursesData {
  university: string;
  faculty: string;
  program_requirements: any;
  majors: {
    Computer_Science: Major;
    Information_Technology: Major;
    Information_Systems: Major;
    Artificial_Intelligence: Major;
    Decision_Support_and_Operations_Research: Major;
  };
}

export function getCoursesData(): CoursesData {
  return coursesJson as any as CoursesData;
}

export function getCourseByCode(code: string): Course | undefined {
  const data = getCoursesData();
  
  function search(obj: any): Course | undefined {
    if (!obj || typeof obj !== 'object') return undefined;
    
    if (Array.isArray(obj)) {
      for (const item of obj) {
        if (item && item.code === code) return item;
        const result = search(item);
        if (result) return result;
      }
    } else {
      if (obj.courses && Array.isArray(obj.courses)) {
        const found = obj.courses.find((c: any) => c.code === code);
        if (found) return found;
      }
      for (const key of Object.keys(obj)) {
        const result = search(obj[key]);
        if (result) return result;
      }
    }
    return undefined;
  }
  
  return search(data);
}

export function getAllCourses(): Course[] {
  const data = getCoursesData();
  const coursesMap = new Map<string, Course>();

  function traverse(obj: any) {
    if (!obj || typeof obj !== 'object') return;
    
    if (Array.isArray(obj)) {
      for (const item of obj) {
        if (item && item.code && item.name) {
          coursesMap.set(item.code, item);
        }
        traverse(item);
      }
    } else {
      if (obj.courses && Array.isArray(obj.courses)) {
        for (const c of obj.courses) {
          if (c && c.code && c.name) {
            coursesMap.set(c.code, c);
          }
        }
      }
      for (const key of Object.keys(obj)) {
        traverse(obj[key]);
      }
    }
  }
  
  traverse(data);
  return Array.from(coursesMap.values());
}

export const MIN_GRADES = {
  Information_Systems: 2.70,
  Computer_Science: 2.56,
  Artificial_Intelligence: 2.39,
  Decision_Support: 1.60,
  Information_Technology: 1.51,
};

export interface PrereqNode {
  code: string;
  course?: Course;
  children: PrereqNode[];
}

export function getPrerequisiteChain(code: string, visited = new Set<string>()): PrereqNode {
  if (visited.has(code)) return { code, children: [] };
  visited.add(code);
  const course = getCourseByCode(code);
  const children: PrereqNode[] = (course?.prerequisites ?? []).map((pCode: string) =>
    getPrerequisiteChain(pCode, new Set(visited))
  );
  return { code, course, children };
}
