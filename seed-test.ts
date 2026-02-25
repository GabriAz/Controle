import { prisma } from './src/lib/db';
import { calculateUrgency } from './src/lib/utils/urgency';

async function main() {
    const deadlineDate = new Date();
    deadlineDate.setHours(18, 0, 0, 0); // Define o deadline para Hoje as 18:00

    const novaTarefa = await prisma.task.create({
        data: {
            taskRef: "#INCENDIO-P1",
            title: "Subir a campanha antes que o cliente tenha um ataque",
            priority: 1, // P1
            deadline: deadlineDate,
            status: "PENDING"
        }
    });

    console.log("Tarefa Criada! Abra a UI: ", novaTarefa);
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
