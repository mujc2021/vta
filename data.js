/* Update these verified release URLs when the paper and code are public. */
window.VTA_RESOURCES = { paper: null, code: null };
window.VTA_DATA = {
  showcases: {
    grasps:{video:'instruction-grasps',kind:'ROBODOJO / INSTRUCTION-CONDITIONED GRASPS',title:'One basket, four instructed grasps.',description:'Changing the instruction changes the acting arm, the grasp point, or the coordination between both arms.',count:'4 grasp variants'},
    tasks:{video:'instruction-tasks',kind:'REAL ROBOT / DIVERSE MANIPULATION',title:'A broad repertoire of instructed behaviors.',description:'A sixteen-case gallery shows diverse object interactions and manipulation tasks executed by the real robot.',count:'16 examples'},
    placement:{video:'instruction-grasp-placement',kind:'REAL ROBOT / FINE-GRAINED INSTRUCTION FOLLOWING',title:'The same object, different ways to interact.',description:'Instructions specify the arm, grasp, motion, and placement, producing distinct behaviors around the same class of objects.',count:'8 examples'}
  },
  tasks: [
    {id:'track',name:'Obstacle',short:'Follow a specified route',video:'track-front',score:95,title:'Route-conditioned reaching',description:'Reach and grasp the target beyond the obstacle, following the instructed route around its front or over its top.'},
    {id:'cube',name:'Cube2Cup',short:'Select the instructed pairing',video:'cube-to-cup',score:90,title:'Resolve the object and destination',description:'Place the specified cube into the cup named in the instruction. The requested pairing determines the action.'},
    {id:'cover',name:'Cover Cube',short:'Understand a spatial relation',video:'cover-cube',score:60,title:'Cover, rather than contain',description:'Invert the cup over the specified cube, realizing the instructed covering relation.'},
    {id:'basket',name:'Cup2Basket',short:'Choose the right compartment',video:'cup-to-basket',score:65,title:'Ground the destination precisely',description:'Move the specified cup into the instructed compartment of the basket.'},
    {id:'pnp',name:'General PnP',short:'Manipulate diverse objects',video:'general-pnp',score:95,title:'Follow intent among varied objects',description:'Select the object named in the instruction and place it in the specified container.'}
  ],
  icl:{
    comic:{reference:'comic-reference',execution:'comic-execution',image:true,label:'ILLUSTRATED IMAGE PROMPT',title:'A sequence of illustrations becomes a robot action.',description:'A four-panel image specifies placing a cube in a cup. The visual reference communicates the interaction without a robot demonstration.'},
    pour:{reference:'pour-reference',execution:'pour-execution',label:'ANIMATED REFERENCE',title:'A new appearance. The same pouring intent.',description:'An animated character provides the behavioral reference; the robot realizes the pouring interaction in its own scene.'},
    fox:{reference:'fox-reference',execution:'fox-execution',label:'ANIMATED REFERENCE',title:'A spatial relation, transferred across agents.',description:'A fox covering a block with a cup specifies the containment relation that the robot reproduces.'},
    dog:{reference:'dog-reference',execution:'dog-execution',label:'ANIMATED REFERENCE',title:'The reference communicates an order of actions.',description:'A dog placing fruit provides a temporal reference for the robot’s fruit-placement behavior.'},
    pickup:{reference:'pickup-reference',execution:'pickup-execution',label:'HUMAN VIDEO REFERENCE',title:'A human reference specifies what to pick up.',description:'The demonstrator selects the figurine; VTA translates the reference into a pickup action in RoboDojo.'}
  },
  priors:[
    {name:'BAGEL',if:[0,2,0,4,0,0,0,0],success:[0,0,0,3,0,0,0,0]},
    {name:'BAGEL + embodied PT',if:[0,12,3,25,3,0,0,0],success:[0,3,0,5,0,0,0,0]},
    {name:'MiniMax H3',if:[100,97,100,93,96,87,32,100],success:[23,6,0,27,0,0,0,0],ours:true}
  ],
  benchmarks:{
    real:{eyebrow:'FIVE UNSEEN REAL-WORLD TASKS',score:'81',title:'Semantic intent survives the transfer.',description:'VTA achieves 81% mean success, compared with 14% for π₀.₅ and 4% for Fast-WAM. The same supervised demonstrations are used for all three models.',protocol:'20 trials per task · 5 tasks · No task-specific fine-tuning',tasks:['Cube2Cup','Cover Cube','Cup2Basket','General PnP','Obstacle'],rows:[{name:'VTA (ours)',scores:[90,60,65,95,95],average:81,ours:true},{name:'π₀.₅',scores:[35,0,20,15,0],average:14},{name:'Fast-WAM',scores:[5,0,10,5,0],average:4}]},
    dojo:{eyebrow:'ROBODOJO-OPEN / EIGHT TASK FAMILIES',score:'31.5',title:'From open instructions to completed tasks.',description:'Video planning supplies behavioral intent; feedback control and reinforcement learning improve its physical realization.',protocol:'100 episodes per task for VTA · 8-task mean · Task completion metric',tasks:['Align Blocks','Solve Equation','Stack Blocks','General Pickup','Classify Objects','Conveyor','Store Tools','Pour'],rows:[{name:'VTA (ours)',scores:[67,54,23,77,31,0,0,0],average:31.5,ours:true},{name:'InternW0-Δ',scores:[0,0,18.67,62.67,0,0,0,0],average:10.17},{name:'MolmoAct2',scores:[0,0,0,35.33,0,0,0,0],average:4.42},{name:'Xiaomi-Robotics-1',scores:[0,0,0,28,.67,0,0,0],average:3.58},{name:'π₀.₅',scores:[0,0,0,12,0,1.33,0,0],average:1.67},{name:'OpenWAM-α',scores:[0,0,0,8.67,0,0,0,0],average:1.08},{name:'GigaWorld-Policy-0',scores:[0,0,0,4,0,0,0,0],average:.5},{name:'π₀',scores:[0,0,0,2,0,0,0,0],average:.25}]},
    twin:{eyebrow:'ROBOTWIN 2.0 / CLEAN-ONLY TRAINING',score:'83.8',title:'Generalization under visual variation.',description:'VTA reaches 83.8% success in randomized scenes, with a 2.56-point drop from clean evaluation. Planning and feedback control handle complementary parts of the transfer.',protocol:'50 tasks · 100 trials per task and setting for VTA · C2R shown by default',tasks:['Clean → random','Clean → clean'],rows:[{name:'VTA (ours)',scores:[83.8,86.36],average:83.8,ours:true},{name:'Qwen-RobotManip-Context',scores:[69.4,84.7],average:69.4},{name:'ME-Dex-1.0',scores:[68.12,89.58],average:68.12},{name:'InternW0',scores:[68,83.2],average:68},{name:'GigaBrain-0.7',scores:[67.92,66.8],average:67.92},{name:'PatchWAM',scores:[66.72,91.56],average:66.72},{name:'π₀.₅',scores:[46,70.7],average:46}]}
  }
};
