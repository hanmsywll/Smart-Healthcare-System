import React from 'react';

const DepartmentCard = ({ title, description, imageSrc, altText, avatars, othersCount }) => {
  return (
    <article className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
      <img 
        src={imageSrc} 
        alt={altText} 
        className="w-full h-40 object-cover" 
        width="600" 
        height="300"
      />
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-sm font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-xs text-gray-500 flex-grow leading-snug">{description}</p>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex -space-x-2">
              {avatars.map((avatar, index) => (
                <img 
                  key={index}
                  src={avatar.src} 
                  alt={avatar.alt} 
                  className="w-6 h-6 rounded-full border-2 border-white" 
                  width="24" 
                  height="24"
                />
              ))}
            </div>
            <span className="text-xs text-gray-400 ml-2">+ {othersCount} others</span>
          </div>
          <button 
            className="ml-auto bg-[#1e2a3a] text-white text-xs px-3 py-1 rounded-md hover:bg-[#16202b] transition"
          >
            See Detail
          </button>
        </div>
      </div>
    </article>
  );
};

const Department = () => {
  const departments = [
    {
      title: "General Medicine",
      description: "Provides comprehensive healthcare services including routine check-ups, preventive care, and treatment for a wide range of illnesses.",
      imageSrc: "https://storage.googleapis.com/a1aa/image/42b32e40-5718-4efc-7a9f-34e50ae29c71.jpg",
      altText: "Close-up photo of a stethoscope lying on white surface with white pills scattered around",
      avatars: [
        { src: "https://storage.googleapis.com/a1aa/image/87915d2f-67b1-4e36-8f71-bb1ad661f733.jpg", alt: "Avatar of person 1" },
        { src: "https://storage.googleapis.com/a1aa/image/6206c5cf-cc6f-4c73-a7c5-e5102eef99c4.jpg", alt: "Avatar of person 2" },
        { src: "https://storage.googleapis.com/a1aa/image/cbbbf54e-644d-432b-de29-9ff35f84ea47.jpg", alt: "Avatar of person 3" },
        { src: "https://storage.googleapis.com/a1aa/image/a6f2ddad-a722-4f4d-1d0c-7d5495a09029.jpg", alt: "Avatar of person 4" },
        { src: "https://storage.googleapis.com/a1aa/image/1f88ac58-efb6-4d47-62af-d9cd52b8e0d9.jpg", alt: "Avatar of person 5" }
      ],
      othersCount: 15
    },
    {
      title: "Cardiology",
      description: "Specializes in the diagnosis and treatment of heart-related conditions, offering advanced cardiac care and preventive measures.",
      imageSrc: "https://storage.googleapis.com/a1aa/image/2f80e74a-4b4c-4b35-73fd-bcc5d131095a.jpg",
      altText: "Detailed anatomical model of a human heart on a white surface",
      avatars: [
        { src: "https://storage.googleapis.com/a1aa/image/87915d2f-67b1-4e36-8f71-bb1ad661f733.jpg", alt: "Avatar of person 1" },
        { src: "https://storage.googleapis.com/a1aa/image/6206c5cf-cc6f-4c73-a7c5-e5102eef99c4.jpg", alt: "Avatar of person 2" },
        { src: "https://storage.googleapis.com/a1aa/image/cbbbf54e-644d-432b-de29-9ff35f84ea47.jpg", alt: "Avatar of person 3" },
        { src: "https://storage.googleapis.com/a1aa/image/a6f2ddad-a722-4f4d-1d0c-7d5495a09029.jpg", alt: "Avatar of person 4" },
        { src: "https://storage.googleapis.com/a1aa/image/1f88ac58-efb6-4d47-62af-d9cd52b8e0d9.jpg", alt: "Avatar of person 5" }
      ],
      othersCount: 10
    },
    {
      title: "Pediatrics",
      description: "Dedicated to the health and well-being of children, providing specialized care for infants, children, and adolescents.",
      imageSrc: "https://storage.googleapis.com/a1aa/image/3c33c8a4-7bf9-402b-b6ae-3d2b86348af6.jpg",
      altText: "Female doctor using a stethoscope to check a baby lying on a bed",
      avatars: [
        { src: "https://storage.googleapis.com/a1aa/image/87915d2f-67b1-4e36-8f71-bb1ad661f733.jpg", alt: "Avatar of person 1" },
        { src: "https://storage.googleapis.com/a1aa/image/6206c5cf-cc6f-4c73-a7c5-e5102eef99c4.jpg", alt: "Avatar of person 2" },
        { src: "https://storage.googleapis.com/a1aa/image/cbbbf54e-644d-432b-de29-9ff35f84ea47.jpg", alt: "Avatar of person 3" },
        { src: "https://storage.googleapis.com/a1aa/image/a6f2ddad-a722-4f4d-1d0c-7d5495a09029.jpg", alt: "Avatar of person 4" },
        { src: "https://storage.googleapis.com/a1aa/image/1f88ac58-efb6-4d47-62af-d9cd52b8e0d9.jpg", alt: "Avatar of person 5" }
      ],
      othersCount: 7
    },
    {
      title: "Dermatology",
      description: "Focuses on the treatment of skin conditions, offering medical and cosmetic dermatology services to improve skin health.",
      imageSrc: "https://storage.googleapis.com/a1aa/image/8dfc889f-c587-44ab-4cc8-b3d54fd81faf.jpg",
      altText: "Close-up of a skin treatment procedure being performed on a person's arm",
      avatars: [
        { src: "https://storage.googleapis.com/a1aa/image/87915d2f-67b1-4e36-8f71-bb1ad661f733.jpg", alt: "Avatar of person 1" },
        { src: "https://storage.googleapis.com/a1aa/image/6206c5cf-cc6f-4c73-a7c5-e5102eef99c4.jpg", alt: "Avatar of person 2" },
        { src: "https://storage.googleapis.com/a1aa/image/cbbbf54e-644d-432b-de29-9ff35f84ea47.jpg", alt: "Avatar of person 3" },
        { src: "https://storage.googleapis.com/a1aa/image/a6f2ddad-a722-4f4d-1d0c-7d5495a09029.jpg", alt: "Avatar of person 4" }
      ],
      othersCount: 5
    },
    {
      title: "Internal Medicine",
      description: "Provides primary care for adults, focusing on the prevention, diagnosis, and treatment of adult diseases.",
      imageSrc: "https://storage.googleapis.com/a1aa/image/c189b3b0-0a21-4171-51d2-1878b1b955c1.jpg",
      altText: "Doctor holding a detailed anatomical model of human intestines",
      avatars: [
        { src: "https://storage.googleapis.com/a1aa/image/87915d2f-67b1-4e36-8f71-bb1ad661f733.jpg", alt: "Avatar of person 1" },
        { src: "https://storage.googleapis.com/a1aa/image/6206c5cf-cc6f-4c73-a7c5-e5102eef99c4.jpg", alt: "Avatar of person 2" },
        { src: "https://storage.googleapis.com/a1aa/image/cbbbf54e-644d-432b-de29-9ff35f84ea47.jpg", alt: "Avatar of person 3" },
        { src: "https://storage.googleapis.com/a1aa/image/a6f2ddad-a722-4f4d-1d0c-7d5495a09029.jpg", alt: "Avatar of person 4" }
      ],
      othersCount: 13
    },
    {
      title: "Orthopedics",
      description: "Specializes in the treatment of musculoskeletal system disorders, including bones, joints, ligaments, tendons, and muscles.",
      imageSrc: "https://storage.googleapis.com/a1aa/image/06323737-6a85-4344-ac3c-1725737ef651.jpg",
      altText: "Doctor adjusting an orthopedic arm brace on a patient's arm",
      avatars: [
        { src: "https://storage.googleapis.com/a1aa/image/87915d2f-67b1-4e36-8f71-bb1ad661f733.jpg", alt: "Avatar of person 1" },
        { src: "https://storage.googleapis.com/a1aa/image/6206c5cf-cc6f-4c73-a7c5-e5102eef99c4.jpg", alt: "Avatar of person 2" },
        { src: "https://storage.googleapis.com/a1aa/image/cbbbf54e-644d-432b-de29-9ff35f84ea47.jpg", alt: "Avatar of person 3" }
      ],
      othersCount: 9
    },
    {
      title: "Neurology",
      description: "Deals with disorders of the nervous system, offering expert care for conditions affecting the brain, spinal cord, and nerves.",
      imageSrc: "https://storage.googleapis.com/a1aa/image/b52a4861-9ee1-49fc-e1bb-edeb0c50ebe8.jpg",
      altText: "Person pointing at a detailed anatomical model of a human brain",
      avatars: [
        { src: "https://storage.googleapis.com/a1aa/image/87915d2f-67b1-4e36-8f71-bb1ad661f733.jpg", alt: "Avatar of person 1" },
        { src: "https://storage.googleapis.com/a1aa/image/6206c5cf-cc6f-4c73-a7c5-e5102eef99c4.jpg", alt: "Avatar of person 2" },
        { src: "https://storage.googleapis.com/a1aa/image/cbbbf54e-644d-432b-de29-9ff35f84ea47.jpg", alt: "Avatar of person 3" },
        { src: "https://storage.googleapis.com/a1aa/image/a6f2ddad-a722-4f4d-1d0c-7d5495a09029.jpg", alt: "Avatar of person 4" }
      ],
      othersCount: 6
    },
    {
      title: "Oncology",
      description: "Focuses on the diagnosis and treatment of cancer, providing comprehensive cancer care and support services.",
      imageSrc: "https://storage.googleapis.com/a1aa/image/c8ea49ac-b3f0-48e7-2a9b-6687f531007a.jpg",
      altText: "Hands holding a teal cancer awareness ribbon and a stethoscope on a white background",
      avatars: [
        { src: "https://storage.googleapis.com/a1aa/image/87915d2f-67b1-4e36-8f71-bb1ad661f733.jpg", alt: "Avatar of person 1" },
        { src: "https://storage.googleapis.com/a1aa/image/6206c5cf-cc6f-4c73-a7c5-e5102eef99c4.jpg", alt: "Avatar of person 2" },
        { src: "https://storage.googleapis.com/a1aa/image/cbbbf54e-644d-432b-de29-9ff35f84ea47.jpg", alt: "Avatar of person 3" },
        { src: "https://storage.googleapis.com/a1aa/image/a6f2ddad-a722-4f4d-1d0c-7d5495a09029.jpg", alt: "Avatar of person 4" }
      ],
      othersCount: 8
    },
    {
      title: "Obstetrics and Gynecology (OB/GYN)",
      description: "Provides care for women's health, including pregnancy, childbirth, and reproductive health.",
      imageSrc: "https://storage.googleapis.com/a1aa/image/efc2b485-142b-4143-abeb-3abdc5ae9744.jpg",
      altText: "Close-up of a person holding pills above their stomach",
      avatars: [
        { src: "https://storage.googleapis.com/a1aa/image/87915d2f-67b1-4e36-8f71-bb1ad661f733.jpg", alt: "Avatar of person 1" },
        { src: "https://storage.googleapis.com/a1aa/image/6206c5cf-cc6f-4c73-a7c5-e5102eef99c4.jpg", alt: "Avatar of person 2" },
        { src: "https://storage.googleapis.com/a1aa/image/cbbbf54e-644d-432b-de29-9ff35f84ea47.jpg", alt: "Avatar of person 3" },
        { src: "https://storage.googleapis.com/a1aa/image/a6f2ddad-a722-4f4d-1d0c-7d5495a09029.jpg", alt: "Avatar of person 4" },
        { src: "https://storage.googleapis.com/a1aa/image/1f88ac58-efb6-4d47-62af-d9cd52b8e0d9.jpg", alt: "Avatar of person 5" }
      ],
      othersCount: 11
    }
  ];

  return (
    <div className="bg-white p-4 sm:p-6 md:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Medical Services</h1>
      <main className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept, index) => (
          <DepartmentCard 
            key={index}
            title={dept.title}
            description={dept.description}
            imageSrc={dept.imageSrc}
            altText={dept.altText}
            avatars={dept.avatars}
            othersCount={dept.othersCount}
          />
        ))}
      </main>
    </div>
  );
};

export default Department;