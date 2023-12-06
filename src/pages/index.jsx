import Loader from "@/web/components/Loader"
import Pagination from "@/web/components/Pagination"
import apiClient from "@/web/services/apiClient"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useRouter } from "next/router"

export const getServerSideProps = async () => {
  const data = await apiClient("/todos").then(({ data: result }) => result)

  return {
    props: { initialData: data },
  }
}
// eslint-disable-next-line max-lines-per-function
const IndexPage = ({ initialData }) => {
  const { query } = useRouter()
  const page = Number.parseInt(query.page || 1, 10)
  const {
    isFetching,
    data: {
      result: todos,
      meta: { count },
    },
    refetch,
  } = useQuery({
    queryKey: ["todos", page],
    queryFn: () =>
      apiClient("/todos", { params: { page } }).then(({ data }) => data),
    initialData,
  })
  const { mutateAsync: toggleTodo } = useMutation({
    mutationFn: (todo) =>
      apiClient.patch(`/todos/${todo.id}`, {
        isDone: !todo.isDone,
      }),
  })
  const { mutateAsync: deleteTodo } = useMutation({
    mutationFn: (todoId) => apiClient.delete(`/todos/${todoId}`),
  })
  const handleClickToggle = (id) => async () => {
    const todo = todos.find(({ id: todoId }) => todoId === id)
    await toggleTodo(todo)
    await refetch()
  }
  const handleClickDelete = async (event) => {
    const todoId = Number.parseInt(event.target.getAttribute("data-id"), 10)
    await deleteTodo(todoId)
    await refetch()
  }

  return (
    <div className="relative">
      {isFetching && <Loader />}
      <table className="w-full">
        <thead>
          <tr>
            {["#", "Description", "Done", "Category", "", "🗑️"].map((label) => (
              <td
                key={label}
                className="p-4 bg-slate-300 text-center font-semibold"
              >
                {label}
              </td>
            ))}
          </tr>
        </thead>
        <tbody>
          {todos.map(({ id, description, isDone, category: { name } }) => (
            <tr key={id} className="even:bg-slate-100">
              <td className="p-4">{id}</td>
              <td className="p-4">{description}</td>
              <td className="p-4">{isDone ? "✅" : "❌"}</td>
              <td className="p-4">{name}</td>
              <td className="p-4">
                <button onClick={handleClickToggle(id)}>Toggle</button>
              </td>
              <td className="p-4">
                <button data-id={id} onClick={handleClickDelete}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination count={count} page={page} className="mt-8" />
    </div>
  )
}

export default IndexPage
