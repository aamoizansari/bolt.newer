/**
 * Parse input XML and convert it into steps.
 * Eg: Input XML:
 *  <boltArtifact id=\"course-selling-platform\" title=\"Course Selling Platform Frontend\">\n
 *    <boltAction type=\"file\" filePath=\"src/types/index.ts\">
 *      \nexport interface Course {\n  id: string;\n  title: string;\n  instructor: string;\n  price: number;\n  thumbnail: string;\n  duration: string;\n  level: 'Beginner' | 'Intermediate' | 'Advanced';\n  rating: number;\n  studentsEnrolled: number;\n  description: string;\n}
 *    </boltAction>
 *  <boltAction type=\"shell\">\nnpm run dev\n</boltAction>
 * </boltArtifact>
 *
 * Output:
 * [{
 *  title: "Course Selling Platform Frontend",
 * status: "pending",
 * },
 * {
 * title: "Create src/types/index.ts",
 * type: StepType.CreateFile,
 * code: "*      \nexport interface Course {\n  id: string;\n  title: string;\n  instructor: string;\n  price: number;\n  thumbnail: string;\n  duration: string;\n  level: 'Beginner' | 'Intermediate' | 'Advanced';\n  rating: number;\n  studentsEnrolled: number;\n  description: string;\n}" 
 * },
 * {
 * title: "Run npm run dev",
 * type: StepType.RunScript,
 * code: "npm run dev"
 * }
 * ]
 * 
 * The input can have strings in the middle, they need to be ignored.
 *
 */
export function parseXml(response: string) {
  
}
