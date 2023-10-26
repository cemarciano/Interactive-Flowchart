/* Number of total columns/semesters: */
window.semesters = 10;

/* List of available colors to toggle a course as completed */
/* The first color is default for selecting options as well, so make sure to choose that one wisely */
window.colors = ["#b1fca4", "#fac6ff", "#a8c9ff"];

// Order of courses matters: do not swap positions. Append at the end.
window.courses = [
    0{ name: "Introducao a Economia", credits: 4, code: "EEI533", semester: 1},
    1{ name: "Fundamentos da Eng de Petroleo", credits: 2, code: "EEI761", semester: 1},
    2{ name: "Computação I", credits: 4, code: "ICP114", semester: 1},
    3{ name: "Geologia", credits: 3, code: "IGL104", semester: 1},
    4{ name: "Fund de Quim Org e Quim Petrol", credits: 2, code: "IQO100", semester: 1},
    5{ name: "Cálculo I", credits: 6, code: "MAC118", semester: 1},

	6{name: "Sistemas Projetivos", credits: 4, code: , semester: 2},
	7{ name: "Física Experimental I", credits: 1, code: "FIS111", semester: 2,},
	8{ name: "Física I", credits: 4, code: "FIT112", semester: 2},
	9{ name: "Computação II", credits: 4, code: "ICP225", semester: 2, requirements: [2]},
	10{ name: "Cálculo II", credits: 4, code: "MAC128", semester: 2, requirements: [5]},
	11{ name: "Álgebra Linear II", credits: 4, code: "MAE125", semester: 2},
	12{ name: "Atividades Acad. Opt. Humanas", credits: 4, semester: 2},




	
    { name: "Mecanica I", credits: 4, code: "EEA212", semester: 3, requirements: [10]},
    { name: "Probabilidade e Estatistica", credits: 4, code: "EEI201", semester: 3, requirements: [5]},
    { name: "Fund Processamento Petróleo", credits: 2, code: "EQE033	", semester: 3},
    { name: "Física Experimental II", credits: 1, code: "FIS121", semester: 2, requirements: [7,8]},
    { name: "Física II", credits: 4, code: "FIT122", semester: 3, requirements: [5, 8]},



    { name: "Álgebra Linear II", credits: 4, code: "MAE125", semester: 2},
    { name: "Sistemas Digitais", credits: 5, code: "EEL480", semester: 2, requirements: [2]},
	
    { name: "Cálculo III", credits: 4, code: "MAC238", semester: 3, requirements: [9]},
    { name: "Física III", credits: 4, code: "FIM230", semester: 3, requirements: [4, 9]},
    { name: "Física Experimental II", credits: 1, code: "FIS121", semester: 2, requirements: [4, 5]},
    { name: "Atividades Acad. Opt. Humanas", credits: 2, semester: 3},
	
    { name: "Fund Processamento Petróleo", credits: 2, code: "EQE033	", semester: 3},
    { name: "Teoria da Computação", credits: 4, code: "EEL881", semester: 3},
    { name: "Arquitetura de Computadores", credits: 5, code: "EEL580", semester: 3},
    { name: "Cálculo III", credits: 4, code: "MAC238", semester: 3, requirements: [9]},
    { name: "Física III", credits: 4, code: "FIM230", semester: 3, requirements: [4, 9]},
    { name: "Física Experimental III", credits: 1, code: "FIN231", semester: 3, requirements: [11]},
	  
    { name: "Atividades Acad. Opt. Humanas", credits: 2, semester: 3},
	
    { name: "Teoria dos Grafos", credits: 4, code: "COS242", semester: 4, requirements: [13]},
    { name: "Estatística e Mod. Probabilísticos", credits: 4, code: "COE241", semester: 4},
    { name: "Computadores e Sociedade", credits: 4, code: "COS471", semester: 4},
    { name: "Cálculo IV", credits: 4, code: "MAC248", semester: 4, requirements: [9]},
    { name: "Física IV", credits: 4, code: "FIM240", semester: 4, requirements: [16, 17]},
    { name: "Física Experimental IV", credits: 1, code: "FIN241", semester: 4, requirements: [18]},
	
    { name: "Banco de Dados", credits: 4, code: "EEL871", semester: 5},
    { name: "Lógica Matemática", credits: 4, code: "COS351", semester: 5},
    { name: "Álg. Linear Computacional", credits: 4, code: "COC473", semester: 5, requirements: [7, 16]},
    { name: "Redes de Computadores I", credits: 4, code: "EEL878", semester: 5},
    { name: "Sistemas Operacionais", credits: 5, code: "EEL770", semester: 5},
    { name: "Química Experimental", credits: 2, code: "IQG112", semester: 5},
	
    { name: "Otimização", credits: 4, semester: 6, code: "COS360", requirements: [0, 16]},
    { name: "Inteligência Computacional", credits: 4, code: "COC361", semester: 6},
    { name: "Engenharia de Software", credits: 4, code: "EEL873", semester: 6},
    { name: "Redes de Computadores II", credits: 4, code: "EEL879", semester: 6},
    { name: "Telecomunic.", credits: 4, code: "COE363", semester: 6},
    { name: "Computação Gráfica", credits: 4, code: "EEL882", semester: 6},
	
    { name: "Programação Avançada", credits: 4, code: "EEL418", semester: 7, requirements: [13, 6]},
    { name: "Computação de Alto Desempenho", credits: 3, code: "COC472", semester: 7},
    { name: "Sistemas Distribuídos", credits: 4, code: "COS470", semester: 7},
    { name: "Gestão do Conhecimento", credits: 4, code: "COP232", semester: 7},
    { name: "Atividades Acad. Optativas", credits: 8, semester: 7, step: 1},
	
    { name: "Construção de Banco de Dados", credits: 4, code: "COS480", semester: 8, requirements: [26]},
    { name: "Empreend. I", credits: 4, code: "COP364", semester: 8},
    { name: "Qualidade de Software", credits: 4, code: "COS482", semester: 8, requirements: [34]},
    { name: "Projeto de Graduação", credits: 4, code: "EEWX00", semester: 8},
    { name: "Atividades Acad. Optativas", credits: 8, semester: 8, step: 1},
    { name: "Estágio Obrigatório", credits: 160, code: "EEWU00", semester: 9},
    { name: "Atividades Acad. Optativas", credits: 16, semester: 9, step: 1},
    { name: "Atividades Acad. Optativas", credits: 8, semester: 10, step: 1},
    { name: "Atividades Acad. Livre Escolha", credits: 8, semester: 10, step: 1},
    { name: "Ativ. Compl. Especiais", credits: 405, semester: 10, step: 15},
    { name: "Química EE", credits: 4, semester: 4}
]
