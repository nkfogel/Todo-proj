const openModalBtn = document.querySelectorAll('.create-task');
const modalOverlay = document.querySelector('.modal__overlay');
const modalWindow = document.querySelector('.modal__window');
const modalCloseBtn = document.querySelectorAll('.close-modal');
const btnAddTask = document.querySelector('.modal__button-ok');

//форма
let inputTitle = document.querySelector('.form-input');
let inputDescription = document.querySelector('.form-textarea');
let radioBlock = document.querySelector('.modal__form-radio');
let radioForm = document.querySelectorAll('.form__radio');

const emptyList = document.querySelector('.empty-list');
const countElement = document.querySelector('.block-task-counter');
const totalTask = document.querySelector('.total')
const completeTask = document.querySelector('.completed');

//complete
const counterElement = document.querySelector('.main__counter')
const counterValue = document.querySelector('.main__quantity-num')
const textComplete = document.querySelector('.main__text')
const mainComplete = document.querySelector('.main__complete')

// насртойки
const openSettingMenuBtn = document.querySelector('.setting-btn');
const settingMenu = document.querySelector('.setting__menu');
const closeSettingMenuBtn = document.querySelector('.close__setting-btn');
const nightThemeBtn = document.querySelector('.night-theme-btn');

// сортировка
let btnSortingUp = document.querySelector('.sorting-btn-up')
let btnSortingDown = document.querySelector('.sorting-btn-down')


// Обработчики событий
openSettingMenuBtn.addEventListener('click', openSetting)
modalOverlay.addEventListener('click', overlayExit)
btnAddTask.addEventListener('click', modalClickSave)
btnSortingUp.addEventListener('click', dateUp)
btnSortingDown.addEventListener('click', dateDown)
// цикл отслеживает клик по любой из 2-х кнопок и запускает функцию открытия модального окна
openModalBtn.forEach(item => {
    item.addEventListener('click', openModal)
})
modalCloseBtn.forEach(item => {
    item.addEventListener('click', () => {
        modalCancel()
    })
})

// Счетчики задач
let counter = 0
let counterAll = 0

// Статус редактирования
let isEditing = false
let currentEditingTask = null

// LocalStorage
let tasksData = JSON.parse(localStorage.getItem('data')) || []



//Инициализация
init()

function init(){
    if(tasksData.length) {
        emptyList.classList.add('none');
        counterElement.style.display = 'block'
    }else{
        emptyList.classList.remove('none');
        counterElement.style.display = 'none'
    }

    counterAll = tasksData.length
    counter = tasksData.filter(task => task.isDone).length
    
    checkCounter()
    isVisibleComplete()
}

// Создание задач из LocalStorage
tasksData.forEach(task => addTask(task, task.isDone))

function openModal() {
    deleteValidation()
    // modalOverlay.classList.add('open')
    modalOverlay.style.display = 'block';
    modalWindow.style.display = 'block';
}
function modalCancel(){
    // e.preventDefault()
    reset()
    deleteValidation()
}

function addTask(data, isComplete = false){
    const {title, description, color, priority, time, isDone = false} = data
    const newTask = document.createElement('div')
    newTask.className = 'main__task'
    newTask.innerHTML = 
    `
    <div class="list-group-item">
        <div class="list-group-item__bage"></div>
        <div class="note">
            <span class="note-title" >${title}</span>
            <span class="note-description">${description}</span>
            <span class="note-priority">${priority}</span>
        </div>
        <div class="note-btn">
            <span>${new Date(time).toLocaleString()}</span>
            ${isComplete ? '<button class="btn-return" type="button">&#8593;</button>' : '<button class="btn-done" type="submit">&check;</button>'}
            ${!isComplete ? '<button class="btn-edit" type="button">&#9998;</button>' : ''}
            <button class="btn-delete" type="button">&times;</button>
        </div>
     </div> 
    `
    const parent = isComplete ? document.querySelector('.main__complete') : document.querySelector('.main__task-container')
    parent.appendChild(newTask)

    const newTaskContainer = newTask.querySelector('.list-group-item__bage')
    newTaskContainer.style.background = color

    addButtons(data, newTask)
}

function removeTask(taskElement, taskTime){
    taskElement.remove()
    tasksData = tasksData.filter(task => task.time !== taskTime)
    localStorage.setItem('data', JSON.stringify(tasksData))
    counterAll--
    checkCounter()
    isVisibleComplete()
}

function toggleCompleteTask(taskElement, taskTime, isComplete){
    const task = tasksData.find(task => task.time === taskTime)
    if (!task) return

    task.isDone = isComplete
    localStorage.setItem('data', JSON.stringify(tasksData))

    taskElement.remove()

    const containerComplete = document.createElement('div')
    containerComplete.className = 'main__task'
    containerComplete.innerHTML = 
    `<div class="list-group-item">
        <div class="list-group-item__bage"></div>
        <div class="note">
            <span class="note-title" >${task.title}</span>
            <span class="note-description">${task.description}</span>
            <span class="note-priority">${task.priority}</span>
        </div>
        <div class="note-btn">
            <span>${new Date(task.time).toLocaleString()}</span>
            ${isComplete ? '<button class="btn-return" type="button">&#8593;</button>' : '<button class="btn-done" type="submit">&check;</button>'}
            ${!isComplete ? '<button class="btn-edit" type="button">&#9998;</button>' : ''}
            <button class="btn-delete" type="button">&times;</button>
        </div>
     </div> 
    `

    const newTaskContainer = containerComplete.querySelector('.list-group-item__bage')
    newTaskContainer.style.background = task.color

    const parent = isComplete ? document.querySelector('.main__complete') : document.querySelector('.main__task-container')
    parent.appendChild(containerComplete)

    if(isComplete){
        counter++
    }else{
        counter--
    }

    addButtons(task, containerComplete)
}

function editTask(taskData, taskElement){
    openModal()
    isEditing = true
    currentEditingTask = {taskData, taskElement}
    inputTitle.value = taskData.title
    inputDescription.value = taskData.description
    document.querySelector('.form-input-color').value = taskData.color
    radioForm.forEach(item => {
        if(item.value === taskData.priority){
        item.checked = true
        }
    })
}

function updateTask(taskTime, taskElement){
    if(!validation()) return

    let priority

    radioForm.forEach(item => {
        if(item.checked){
            priority = item.value
        }
        })
    
    
    const updatedTask = {
        title: inputTitle.value,
        description: inputDescription.value,
        color: document.querySelector('.form-input-color').value,
        priority,
        time: taskTime,
        isDone: currentEditingTask.taskData.isDone
    }
    const taskIndex = tasksData.findIndex(task => task.time === taskTime);
    if(taskIndex !== -1){
        tasksData[taskIndex] = updatedTask
    }
    localStorage.setItem('data', JSON.stringify(tasksData))

    taskElement.innerHTML =
    ` 
    <div class="list-group-item">
        <div class="list-group-item__bage"></div>
        <div class="note">
            <span class="note-title" >${updatedTask.title}</span>
            <span class="note-description">${updatedTask.description}</span>
            <span class="note-priority">${updatedTask.priority}</span>
        </div>
        <div class="note-btn">
             <span>${new Date(updatedTask.time).toLocaleString()}</span>
             ${updatedTask.isDone ? '<button class="btn-return" type="button">&#8593;</button>' : '<button class="btn-done" type="submit">&check;</button>'}
            <button class="btn-delete" type="button">&times;</button>
            <button class="btn-edit" type="button">&#9998;</button>
        </div>
     </div> 
    `
    const newTaskContainer = taskElement.querySelector('.list-group-item__bage')
    newTaskContainer.style.background = updatedTask.color

    addButtons(updatedTask,taskElement)

    isEditing = false
    currentEditingTask = null
    reset()
}



function addButtons(taskData, taskElement){
    const deleteButton = taskElement.querySelector('.btn-delete')
    if(deleteButton){
        deleteButton.addEventListener('click', () => removeTask(taskElement, taskData.time))
    }
    if(taskData.isDone){
        const returnButton = taskElement.querySelector('.btn-return')
        if(returnButton){
            returnButton.addEventListener('click', () => toggleCompleteTask(taskElement, taskData.time, false))
        }
    }else{
        const completeButton = taskElement.querySelector('.btn-done')
        if(completeButton){
            completeButton.addEventListener('click', () => toggleCompleteTask(taskElement, taskData.time, true))
        }
    }
    const editButton = taskElement.querySelector('.btn-edit')
    if(editButton){
        editButton.addEventListener('click', () => editTask(taskData, taskElement))
    }

    checkCounter()
    isVisibleComplete()
}

function isVisibleComplete() {
    if(counter > 0){
        mainComplete.style.display = 'block'
        textComplete.style.display = 'block'
    }else{
        mainComplete.style.display = 'none'
        textComplete.style.display = 'none'
    }
}

function checkCounter() {
    if(counterAll <= 0){
        counterElement.style.display = 'none'
        emptyList.classList.remove('none');
    }else{
        counterElement.style.display = 'block'
        emptyList.classList.add('none');
    }
    counter = tasksData.filter(task => task.isDone).length
    counterValue.innerHTML = `${counter}/${counterAll}`
}

function reset() {
    modalOverlay.style.display = 'none'
    modalWindow.style.display = 'none'
    inputTitle.value = ''
    inputDescription.value = ''

    for(let radio of radioForm){
        radio.checked = false
    }
    isEditing = false
    currentEditingTask = null
}

function modalClickSave(e){
    e.preventDefault()
   if(isEditing){
    if(currentEditingTask){
        updateTask(currentEditingTask.taskData.time, currentEditingTask.taskElement)
    }
   }else{
    createTask()
   }
}


function validation() {
    inputTitle.value ? inputTitle.classList.remove('error') : inputTitle.classList.add('error')
    inputDescription.value ? inputDescription.classList.remove('error') : inputDescription.classList.add('error')
    if(radioForm.length > 0){
        let checked = false;
        radioForm.forEach(item => {
            if(item.checked){
                checked = true
            }
        })
        if(!checked){
            radioBlock.classList.add('error')
            return false
        }else{
            radioBlock.classList.remove('error')
        }
    }
    
    return inputTitle.value && inputDescription.value
    
}

function createTask(e) {
    if (!validation() || isEditing) return

    emptyList.classList.add('none')

    let priority

    radioForm.forEach(item => {
        if(item.checked){
            priority = item.value
        }
        })

    let newTaskData = {
        title: inputTitle.value,
        description: inputDescription.value,
        color: document.querySelector('.form-input-color').value,
        priority,
        time: new Date().getTime(),
        isDone:false
    }
    tasksData.push(newTaskData)
    localStorage.setItem('data', JSON.stringify(tasksData))

    addTask(newTaskData)
    reset()

    counterAll++
    checkCounter()
    isVisibleComplete()
}

// открытие окна настроек
openSettingMenuBtn.addEventListener('click', openSetting)
function openSetting() {
    settingMenu.classList.add('open')
}
// закрытие окна настроек
closeSettingMenuBtn.addEventListener('click', closeSettingMenu)
function closeSettingMenu() {
    settingMenu.classList.remove('open')
}
    
const theme = localStorage.getItem('theme');
if(theme){
    document.body.classList.add(theme)
}

nightThemeBtn.addEventListener('click', function(){
    document.body.classList.toggle('night-theme')

    const theme = localStorage.getItem('theme')
    if(theme === 'night-theme'){
        localStorage.setItem('theme', '')
    }else{
        localStorage.setItem('theme', 'night-theme')
    }
})

function overlayExit(e){
    if( e.target === modalOverlay){
        reset()
    }
}
function deleteValidation(){
    inputTitle.classList.remove('error')
    inputDescription.classList.remove('error')
    radioBlock.classList.remove('error')
}


function dateUp(isComplete){
    tasksData.sort((a, b) => b.time - a.time)
    updateSortTasks() 
    if(isComplete){
        tasksData.sort((a, b) => b.time - a.time)
        updateSortTasks()
    }
    localStorage.setItem('data', JSON.stringify(tasksData))
}

function dateDown(task){
    tasksData.sort((a, b) => a.time - b.time)
    updateSortTasks()
    if(task.isDone){
        tasksData.sort((a, b) => a.time = b.time)
        updateSortTasks()
    }
    localStorage.setItem('data', JSON.stringify(tasksData))
}

function updateSortTasks() {
    const taskContainer = document.querySelector('.main__task-container')
    const completedContainer = document.querySelector('.main__complete')

    taskContainer.innerHTML = ''
    completedContainer.innerHTML = ''

    tasksData.forEach(task => addTask(task, task.isDone))
    checkCounter()
    isVisibleComplete()
}






































// const createTaskBtn = document.querySelectorAll('.create-task')
// const modal = document.querySelector('.modal__background')
// const emptyList = document.querySelector('.empty-list')
// const btnCancelModal = document.querySelector('.modal__button-cancel')
// const btnCloseModal = document.querySelector('.modal__window-close')
// const form = document.querySelector('#form')
// const btnAddTask = document.querySelector('.modal__button-ok')

// const nightThemeBtn = document.querySelector('.night-theme-btn')

// const openSettingMenuBtn = document.querySelector('.setting-btn');
// const settingMenu = document.querySelector('.setting__menu');
// const closeSettingMenuBtn = document.querySelector('.close__setting-btn')

// const tasksListDone = document.querySelector('.list-group-done')
// const tasksList = document.querySelector('.list-group')
// const listItem = document.querySelector('.list-group-item')

// const blockTaskDone = document.querySelector('.container__done-task')


// const counterBlock = document.querySelector('.block-task-counter')


// // редактирование
// const editingBlock = document.querySelector('.editing__container')
// const cancelEditBtn = document.querySelector('.edit-form__cancel-btn')
// const okEditBtn = document.querySelector('.edit-form__ok-btn')


// // сортировка
// let btnSortingUp = document.querySelector('.sorting-btn-up')
// let btnSortingDown = document.querySelector('.sorting-btn-down')


// // 
// let tasks = []

// // Редактировние 
// let currentEditingTask = null;

// let isEditing = false;


// // начальная проверка локального хранилища перед началом работы на сайте
// if(localStorage.getItem('tasks')){
//     tasks = JSON.parse(localStorage.getItem('tasks'))
//     // console.log(tasks)
//     tasks.forEach(function(task){
//         renderTask(task)
//     })
// }
// checkLists()
// checkEmptyList()
// taskCounter()



// // цикл отслеживает клик по любой из 2-х кнопок и запускает функцию открытия модального окна
// createTaskBtn.forEach(item => {
//     item.addEventListener('click', () => {
//         isEditing = false
//         openModal()
//     })
// })
// // функция открытия модального окна
// function openModal(card){
//     console.log(isEditing)
//     modal.classList.add('open')

//     if(isEditing){
//         document.querySelector('.modal__window-title-new').innerHTML = 'редактированной'
//         let task = tasks.find(el => el.id === +card.id);

//         let inputForm = document.querySelector('.form-input')
//         let textareaForm = document.querySelector('.form-textarea')
//         let colorForm = document.querySelector('.form-input-color')
//         let radio = document.querySelectorAll('.form__radio')

//         radio.forEach(item => {
//             if(item.value === task.priority){
//             item.checked = true
//             }
//         })

//         colorForm.value = task.color
//         inputForm.value = task.title
//         textareaForm.value = task.description

//         console.log(card)
//         btnAddTask.addEventListener('click', (event) => {
//             event.preventDefault()


//             if(inputForm.value.length === 0){
//                 inputForm.classList.add('error')
//                 return false
//             }else{
//                 inputForm.classList.remove('error')
//             }

//             if(textareaForm.value.length === 0){
//                 textareaForm.classList.add('error')
//                 return false
//             }else{
//                 textareaForm.classList.remove('error')
//             }

//             task.title = inputForm.value
//             task.description = textareaForm.value
//             task.color =  colorForm.value

//             radio.forEach(item => {
//                 if(item.checked){
//                     task.priority = item.value
//                 }
//             })
//             console.log(card,123)
//             card.innerHTML = 
//             `
//             <div class="list-group-item__bage"></div>
//             <div class="note">
//                 <span class="note-title" >${task.title}</span>
//                 <span class="note-description">${task.description}</span>
//                 <span class="note-priority">${task.priority}</span>
//             </div>
//             <div class="note-btn">
//                 <span>${task.date}</span>
//                 <button class="btn-done" type="submit" data-action ='done'>&check;</button>
//                 <button class="btn-delete" type="button" data-action ='delete'>&times;</button>
//                 <button class="btn-edit" type="button" data-action ='edit'>&#9998;</button>
//             </div>
//             `
//             modal.classList.remove('open')
//             saveToLS()
//             changeColor(task)
//             return true
//         })
//     }else{
//         btnAddTask.addEventListener('click', (event) => {
//             event.preventDefault()
           
            
//             let inputForm = document.querySelector('.form-input')
//             let textareaForm = document.querySelector('.form-textarea')
//             let colorForm = document.querySelector('.form-input-color')
//             let radio = document.querySelectorAll('.form__radio')
//             let radioBlock = document.querySelector('.modal__form-radio')
//             let date = new Date().toLocaleString()

//             let priority

//             radio.forEach(item => {
//             if(item.checked){
//                priority = item.value
//             }
//             })

//             newTask = {
//                 title: inputForm.value,
//                 description: textareaForm.value,
//                 color: colorForm.value,
//                 priority,
//                 date,
//                 done: false,
//                 id: Date.now(),
//             }

//                 // валидация
//             if(inputForm.value.length === 0){
//                 inputForm.classList.add('error')
//                 return false
//             }else{
//                 inputForm.classList.remove('error')
//             }

//             if(textareaForm.value.length === 0){
//                 textareaForm.classList.add('error')
//                 return false
//             }else{
//                 textareaForm.classList.remove('error')
//             }

//             if(radio.length > 0){
//                 let checked = false;
//                 radio.forEach(item => {
//                     if(item.checked){
//                         checked = true
//                     }
//                 })
//                 if(!checked){
//                     radioBlock.classList.add('error')
//                     return false
//                 }else{
//                     radioBlock.classList.remove('error')
//                 }
//             }

//             tasks.push(newTask)

//             reset()
//             saveToLS()
//             renderTask(newTask)
//             checkEmptyList()
//             checkLists()
//             taskCounter()
//             changeColor(newTask)
//             return true     
//         })
//     }
// }


// // при клике запускается функция закрытия модального окна
// btnCancelModal.addEventListener('click', cancelModal);
// function cancelModal() {
//     modal.classList.remove('open')
//     btnAddTask.removeEventListener('click', () => {}, false)
//     delteValidation()
// }

// // при клике запускается функция закрытия модального окна
// btnCloseModal.addEventListener('click', closeModal);
// function closeModal() {
//     modal.classList.remove('open')
//     delteValidation()
//     reset()
// }


// // открытие окна настроек
// openSettingMenuBtn.addEventListener('click', openSettingMenu)
// function openSettingMenu() {
//     settingMenu.classList.add('open')
// }
// // закрытие окна настроек
// closeSettingMenuBtn.addEventListener('click', closeSettingMenu)
// function closeSettingMenu() {
//     settingMenu.classList.remove('open')
// }
    


// const theme = localStorage.getItem('theme');
// if(theme){
//     document.body.classList.add(theme)
// }

// nightThemeBtn.addEventListener('click', function(){
//     document.body.classList.toggle('night-theme')

//     const theme = localStorage.getItem('theme')
//     if(theme === 'night-theme'){
//         localStorage.setItem('theme', '')
//     }else{
//         localStorage.setItem('theme', 'night-theme')
//     }
// })

// function changeColor(task){
//     document.querySelector('.list-group-item__bage').style.background = task.color
// }

// function checkLists() {

//     let tasksListTitle = document.querySelector('.block-plan-task')

//     if(tasksListDone.children.length === 0){
//         blockTaskDone.classList.remove('open')
//     }else{
//         blockTaskDone.classList.add('open')
//     }

//     if(tasksList.children.length === 0){
//         tasksListTitle.style.display = 'none'
//     }else{
//         tasksListTitle.style.display = 'flex'
//     }

//     if(tasks.length === 0){
//         counterBlock.classList.remove('open')
//         emptyList.classList.remove('none')
//     }

// }

// function checkEmptyList() {
//    if(tasks.length > 0){
//     emptyList.classList.add('none')
//     counterBlock.classList.add('open')
//    }else{
//     emptyList.classList.remove('none')
//     counterBlock.classList.remove('open')
//    }
// }

// function taskCounter() {
//     let totalTasks = document.querySelector('.total')
//     let completedTasks = document.querySelector('.completed')
//     totalTasks.textContent = tasks.length;
//     completedTasks.textContent = tasksListDone.children.length
//     saveToLS()
// }

// function renderTask(task) {
//     const cssClassTitle = task.done ? "note-title note-title--done" : "note-title"
//     const cssClassDescription = task.done ? "note-priority note-priority--done" : "note-priority"
//     const cssClassPriopity = task.done ? "note-description note-description--done" : "note-description"


//     let card = document.createElement('li')
//     card.id = task.id;
//     card.className = 'list-group-item';
//     card.innerHTML = !task.done ? 
//     `
//         <div class="list-group-item__bage"></div>
//         <div class="note">
//             <span class="note-title" >${task.title}</span>
//             <span class="note-description">${task.description}</span>
//             <span class="note-priority">${task.priority}</span>
//         </div>
//         <div class="note-btn">
//             <span>${task.date}</span>
//             <button class="btn-done" type="submit" data-action ='done'>&check;</button>
//             <button class="btn-delete" type="button" data-action ='delete'>&times;</button>
//             <button class="btn-edit" type="button" data-action ='edit'>&#9998;</button>
//         </div>
//     `:
//     `
//         <div class="list-group-item__bage"></div>
//         <div class="note">
//             <span class="${cssClassTitle}" >${task.title}</span>
//             <span class="${cssClassDescription}">${task.priority}</span>
//             <span class="${cssClassPriopity}">${task.priority}</span>
//         </div>
//         <div class="note-btn">
//             <span>${task.date}</span>
//             <button class="btn-delete" type="button" data-action ='delete'>&times;</button>
//             <button class="btn-return" type="button" data-action ='returnTask'>&#8593;</button>
//         </div>       
//     `
//     if(task.done){
//         tasksListDone.prepend(card)
//     }else{
//         tasksList.prepend(card)
       
//     }

//     changeColor(task)

//     let btnDone = document.querySelector('.btn-done')
//     if(btnDone){
//         btnDone.addEventListener('click', doneTask)
//     }
    
//     let btnDelete = document.querySelector('.btn-delete')
//     if(btnDelete){
//         btnDelete.addEventListener('click', deleteTask)
//     }
    
//     let btnEdit = card.querySelector('.btn-edit')
//     if(btnEdit){
//         btnEdit.addEventListener('click', () => editTask(card))
//     }

//     let btnReturn = document.querySelector('.btn-return')
//     if(btnReturn){
//         btnReturn.addEventListener('click', returnTask)
//     }
    
// }

// function returnTask(event) {
//     if(event.target.dataset.action === 'returnTask'){

//         tasksListDone.innerHTML = ''
//         tasksList.innerHTML = ''
//         const parentNode = event.target.closest('.list-group-item')

//         const id = Number(parentNode.id);

//         const task = tasks.find(function(task){
//             if(task.id === id){
//                 return true
//             }
//         })
//         // task.done = обратное значение от task.done (done: true)
//         task.done = !task.done

//         tasks.forEach(function(task){
//             renderTask(task)
//         })

//     }
//     taskCounter()
//     checkLists()
//     saveToLS()
// }

// function doneTask(event) {
//     if(event.target.dataset.action === 'done'){

//         tasksListDone.innerHTML = ''
//         tasksList.innerHTML = ''

//         const parentNode = event.target.closest('.list-group-item')

//         // console.log(parentNode)

//         const id = Number(parentNode.id);
//         console.log(parentNode.id)

//         const task = tasks.find(function(task){
//             if(task.id === id){
//                 return true
//             }
//         })
//         // task.done = обратное значение от task.done (done: true)
//         task.done = !task.done

//         blockTaskDone.classList.add('open')

//         tasks.forEach(function(task){
//             renderTask(task)
//         })
        
//         const taskTitle = parentNode.querySelector('.note-title')
//         const taskDescription = parentNode.querySelector('.note-description')
//         const taskPriority = parentNode.querySelector('.note-priority')

//         taskTitle.classList.toggle('note-title--done')
//         taskDescription.classList.toggle('note-description--done')
//         taskPriority.classList.toggle('note-priority--done')

//         // location.reload();
//     }
//     taskCounter()
//     saveToLS()
//     checkLists()
// }
    

// // удаление задачи
// function deleteTask(e){
//     if(e.target.dataset.action !== 'delete'){
//         return
//     }
//     const parentNode = e.target.closest('.list-group-item')
//     const id = Number(parentNode.id)
//     console.log(parentNode)
//     console.log(parentNode.id)
    
//     tasks = tasks.filter(function(task){
//         if (task.id === id){
//             return false
//         }else{
//             return true
//         }
//     })

//     saveToLS()
//     alert('уверены?')
//     parentNode.remove()
//     checkLists()
//     taskCounter()
// }
// // function openEditWindow(event) {
// //     editingBlock.classList.add('open')

// //     let task = tasks.find(el => el.id === +event.target.closest('.list-group-item').id);

// //     let inputEdit = document.querySelector('.input-edit')
// //     let textareaEdit = document.querySelector('.textarea-edit')
// //     let colorEdit = document.querySelector('.edit-input-color')
// //     let radioEdit = document.querySelectorAll('.edit-radio')
// //     // let editRadioBlock = document.querySelector('.edit__form-radio')
// //     // let editRadio = document.querySelectorAll('.edit-form__radio')
// //     radioEdit.forEach(item => {
// //         if(item.value === task.priority){
// //         item.checked = true
// //         }
// //     })

// //     colorEdit.value = task.color
// //     inputEdit.value = task.title
// //     textareaEdit.value = task.description
// //     // radioEdit = task.priority

// //     okEditBtn.addEventListener('click', (event) => {
// //         event.preventDefault()
        
// //         if(inputEdit.value.length === 0){
// //             inputEdit.classList.add('error')
// //             return
// //         }
// //         else{
// //             inputEdit.classList.remove('error')
// //         }

// //         if(textareaEdit.value.length === 0){
// //             textareaEdit.classList.add('error')
// //             return
// //         }else{
// //             textareaEdit.classList.remove('error')
// //         }
        
// //         task.title = inputEdit.value
// //         task.description = textareaEdit.value
// //         task.color = colorEdit.value

// //         radioEdit.forEach(item => {
// //             if(item.checked){
// //                 task.priority = item.value
// //             }
// //         })
        
// //         tasksList.innerHTML = '';

// //         tasks.forEach(function(task){
// //             renderTask(task)
// //             saveToLS()
// //         })
// //         editingBlock.classList.remove('open')
// //     })
// // //    saveToLS()
// // }

// // cancelEditBtn.addEventListener('click', () => {
// //     editingBlock.classList.remove('open')
// // })


// function editTask(event){
//     isEditing = true;
//     openModal(event)
// }

// btnSortingDown.addEventListener('click', sortDown)
// function sortDown() {
//     tasksListDone.innerHTML = ''
//     tasksList.innerHTML = ''

//     tasks = tasks.sort((a,b) => b.id - a.id)

//     tasks.forEach(function(task){
//         renderTask(task)
//     })

//     saveToLS()
//     // console.log(tasks)
// }
//  function sortFn(a,b){
//     return b.id - a.id
//  }

// btnSortingUp.addEventListener('click', sortUp)
// function sortUp(){
//     tasksListDone.innerHTML = ''
//     tasksList.innerHTML = ''

//     tasks = tasks.sort((a,b) => a.id - b.id)

//     tasks.forEach(function(task){
//         renderTask(task)
//     })
//      saveToLS()
//     // console.log(tasks)
// }



// function saveToLS() {
//     localStorage.setItem('tasks', JSON.stringify(tasks))
// }


// // очистка полей формы
// function reset() {
//     let radioForm = document.querySelectorAll('.form__radio')
//     for(let radio of radioForm){
//         radio.checked = false
//     }
//     document.querySelector('.form-input').value = '';
//     document.querySelector('.form-textarea').value = '';
//     modal.classList.remove('open')
// }


// // удаление полей валидации 
// function delteValidation(){
//     let inputForm = document.querySelector('.form-input')
//     let textareaForm = document.querySelector('.form-textarea')
//     let radioBlock = document.querySelector('.modal__form-radio')
//     inputForm.classList.remove('error')
//     textareaForm.classList.remove('error')
//     radioBlock.classList.remove('error')
// }

// function deleteEditValidation(){
//     let inputEdit = document.querySelector('.form-input')
//     let textareaEdit = document.querySelector('.form-textarea')
//     // let radioBlock = document.querySelector('.modal__form-radio')
//     inputEdit.classList.remove('error')
//     textareaEdit.classList.remove('error')
//     // radioBlock.classList.remove('error')
// }
