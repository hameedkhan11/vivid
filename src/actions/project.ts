"use server";
import { client } from "@/lib/prisma";
import { OutlineCard } from "@/lib/types";
import { onAuthenticateUser } from "./user";
import { JsonValue } from "@prisma/client/runtime/library";

export const createProject = async (title: string, outlines: OutlineCard[]) => {
  try {
    console.log("Creating project with title:", title);
    console.log("Outlines:", outlines);
    // Validation: Ensure title and outlines are provided
    if (!title || !outlines || outlines.length === 0) {
      return { status: 400, error: "Title and outlines are required." };
    }

    // Map the outlines to extract only the titles into a string array
    const allOutlines = outlines.map((outline) => outline.title);

    const checkUser = await onAuthenticateUser();

    if (checkUser.status !== 200 || !checkUser.user) {
      return { status: 403, error: "User not authenticated" };
    }

    // Create the project in the database
    const project = await client.project.create({
      data: {
        title,
        outlines: allOutlines,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: checkUser.user.id,
      },
    });

    if (!project) {
      return { status: 500, error: "Failed to create project" };
    }

    //also have to push project in user project array

    // Return the created project as a response
    return { status: 200, data: project };
  } catch (error) {
    console.error("🔴 ERROR", error);
    return { status: 500, error: "Internal server error" };
  }
};

export const getRecentProjects = async () => {
  try {
    const checkUser = await onAuthenticateUser();

    if (checkUser.status !== 200 || !checkUser.user) {
      return { status: 403, error: "User not authenticated" };
    }

    // Fetch the recent prompts for the user
    const projects = await client.project.findMany({
      where: {
        userId: checkUser.user.id,
        isDeleted: false,
      },

      orderBy: {
        updatedAt: "desc",
      },
      take: 5,
    });

    if (projects.length === 0) {
      return { status: 404, error: "No recent prompts found" };
    }

    return { status: 200, data: projects };
  } catch (error) {
    console.error("🔴 ERROR", error);
    return { status: 500, error: "Internal server error" };
  }
};

export const getAllProjects = async () => {
  try {
    const checkUser = await onAuthenticateUser();

    if (checkUser.status !== 200 || !checkUser.user) {
      return { status: 403, error: "User not authenticated" };
    }

    // Fetch all projects for the user with an optional title search
    const projects = await client.project.findMany({
      where: {
        userId: checkUser.user.id,
        isDeleted: false,
      },
      orderBy: {
        updatedAt: "desc", // Sort by the most recently updated
      },
    });

    if (projects.length === 0) {
      return { status: 404, error: "No projects found" };
    }

    return { status: 200, data: projects };
  } catch (error) {
    console.error("🔴 ERROR", error);
    return { status: 500, error: "Internal server error" };
  }
};

//get all shared projects
// export const getSharedProjects = async () => {
//   try {
//     const user = await currentUser();
//     if (!user) {
//       return { status: 403, error: "User not authenticated" };
//     }

//     const userExist = await client.user.findUnique({
//       where: {
//         clerkId: user.id,
//       },
//     });

//     if (!userExist) {
//       return { status: 404, error: "User not found in the database" };
//     }

//     const sharedProjects = await client.project.findMany({
//       where: {
//         SharedBy: {
//           some: {
//             id: user.id, // Filter by the user who shared the projects
//           },
//         },
//         isDeleted: false, // Optional: filter out deleted projects if needed
//       },
//       include: {
//         SharedBy: true, // Include the sharedBy relation to get the user details
//       },
//     });

//     if (sharedProjects.length === 0) {
//       return { status: 404, error: "No shared projects found" };
//     }
//     console.log("Shared Projects:", sharedProjects);

//     return { status: 200, data: sharedProjects };
//   } catch (error) {
//     console.error("🔴 ERROR", error);
//     return { status: 500, error: "Internal server error" };
//   }
// };

export const deleteProject = async (projectId: string) => {
  try {
    console.log("Deleting project with ID:", projectId);
    const checkUser = await onAuthenticateUser();

    if (checkUser.status !== 200 || !checkUser.user) {
      return { status: 403, error: "User not authenticated" };
    }

    // Update the project to mark it as deleted
    const updatedProject = await client.project.update({
      where: {
        id: projectId,
      },
      data: {
        isDeleted: true,
      },
    });

    if (!updatedProject) {
      return { status: 500, error: "Failed to delete project" };
    }

    return { status: 200, data: updatedProject };
  } catch (error) {
    console.log("🔴 ERROR", error);
    return { status: 500, error: "Internal server error" };
  }
};

export const getDeletedProjects = async () => {
  try {
    const checkUser = await onAuthenticateUser();

    if (checkUser.status !== 200 || !checkUser.user) {
      return { status: 403, error: "User not authenticated" };
    }

    // Fetch the deleted projects for the user
    const projects = await client.project.findMany({
      where: {
        userId: checkUser.user.id,
        isDeleted: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    if (projects.length === 0) {
      return { status: 200, message: "No deleted projects found", data: [] };
    }

    return { status: 200, data: projects };
  } catch (error) {
    console.error("🔴 ERROR", error);
    return { status: 500, error: "Internal server error" };
  }
};

export const recoverProject = async (projectId: string) => {
  try {
    console.log("Recovering project with ID:", projectId);
    const checkUser = await onAuthenticateUser();

    if (checkUser.status !== 200 || !checkUser.user) {
      return { status: 403, error: "User not authenticated" };
    }

    // Update the project to mark it as deleted
    const updatedProject = await client.project.update({
      where: {
        id: projectId,
      },
      data: {
        isDeleted: false,
      },
    });

    if (!updatedProject) {
      return { status: 500, error: "Failed to recover project" };
    }

    return { status: 200, data: updatedProject };
  } catch (error) {
    console.log("🔴 ERROR", error);
    return { status: 500, error: "Internal server error" };
  }
};

export const deleteAllProjects = async (projectIds: string[]) => {
  try {
    console.log("Deleting all projects with IDs:", projectIds);

    // Validate input
    if (!Array.isArray(projectIds) || projectIds.length === 0) {
      return { status: 400, error: "No project IDs provided." };
    }

    // Authenticate user
    const checkUser = await onAuthenticateUser();

    if (checkUser.status !== 200 || !checkUser.user) {
      return { status: 403, error: "User not authenticated." };
    }

    const userId = checkUser.user.id;

    // Ensure projects belong to the authenticated user
    const projectsToDelete = await client.project.findMany({
      where: {
        id: {
          in: projectIds,
        },
        userId: userId, // Only delete projects owned by this user
      },
    });

    if (projectsToDelete.length === 0) {
      return { status: 404, error: "No projects found for the given IDs." };
    }

    // Delete the projects
    const deletedProjects = await client.project.deleteMany({
      where: {
        id: {
          in: projectsToDelete.map((project) => project.id),
        },
      },
    });

    console.log("Deleted projects count:", deletedProjects.count);

    return {
      status: 200,
      message: `${deletedProjects.count} projects successfully deleted.`,
    };
  } catch (error) {
    console.error("🔴 ERROR", error);
    return { status: 500, error: "Internal server error." };
  }
};


//get project by Id
export const getProjectById = async (projectId: string) => {
  try {
    console.log("Fetching project with ID:", projectId);
    const checkUser = await onAuthenticateUser();

    if (checkUser.status !== 200 || !checkUser.user) {
      return { status: 403, error: "User not authenticated" };
    }

    // Fetch the project by ID
    const project = await client.project.findFirst({
      where: {
        id: projectId,
      },
    });

    if (!project) {
      return { status: 404, error: "Project not found" };
    }

    return { status: 200, data: project };
  } catch (error) {
    console.error("🔴 ERROR", error);
    return { status: 500, error: "Internal server error" };
  }
};

//get All Sellable projects
export const getSellableProjects = async () => {
  try {
    console.log("Fetching sellable projects");
    const checkUser = await onAuthenticateUser();

    if (checkUser.status !== 200 || !checkUser.user) {
      return { status: 403, error: "User not authenticated" };
    }

    // Fetch the sellable projects
    const projects = await client.project.findMany({
      where: {
        isSellable: true,
      },
    });

    if (projects.length === 0) {
      return { status: 404, error: "No sellable projects found" };
    }

    return { status: 200, data: projects };
  } catch (error) {
    console.error("🔴 ERROR", error);
    return { status: 500, error: "Internal server error" };
  }
};


//update SLides datd

export const updateSlides = async (projectId: string, slides: JsonValue) => {
  try {
    // console.log("Updating slides for project with ID:", projectId);
    // console.log("Slides:", slides);

    // Validate input
    if (!projectId || !slides ) {
      return { status: 400, error: "Project ID and slides are required." };
    }

    // Update the project with the new slides
    const updatedProject = await client.project.update({
      where: {
        id: projectId,
      },
      data: {
        slides,
      },
    });

    if (!updatedProject) {
      return { status: 500, error: "Failed to update slides" };
    }

    return { status: 200, data: updatedProject };
  } catch (error) {
    console.error("🔴 ERROR", error);
    return { status: 500, error: "Internal server error" };
  }
}


export const updateTheme = async(projectId:string, theme: string) => {
  try{// Validate input
    if (!projectId || !theme ) {
      return { status: 400, error: "Project ID and slides are required." };
    }

    // Update the project with the new slides
    const updatedProject = await client.project.update({
      where: {
        id: projectId,
      },
      data: {
        themeName:theme,
      },
    });

    if (!updatedProject) {
      return { status: 500, error: "Failed to update slides" };
    }

    return { status: 200, data: updatedProject };

  }catch(error){
    console.error("🔴 ERROR", error);
    return { status: 500, error: "Internal server error" };
  }
}